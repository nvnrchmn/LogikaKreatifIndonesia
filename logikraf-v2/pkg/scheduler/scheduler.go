package scheduler

import (
	"context"
	"fmt"
	"runtime/debug"
	"sync"
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

// Scheduler polls cron_jobs once a minute and runs any job whose schedule says now.
type Scheduler struct {
	db    *gorm.DB
	cron  *cron.Cron
	jobs  map[string]Job
	mu    sync.RWMutex
	stop  chan struct{}
}

func New(db *gorm.DB) *Scheduler {
	return &Scheduler{
		db:   db,
		jobs: make(map[string]Job),
		stop: make(chan struct{}),
	}
}

func (s *Scheduler) Register(j Job) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs[j.Key()] = j
}

func (s *Scheduler) RunOnce(ctx context.Context, key string) error {
	s.mu.RLock()
	j, ok := s.jobs[key]
	s.mu.RUnlock()
	if !ok {
		return fmt.Errorf("job not registered: %s", key)
	}
	return s.exec(ctx, j)
}

func (s *Scheduler) exec(ctx context.Context, j Job) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("job %s panic: %v\n%s", j.Key(), r, string(debug.Stack()))
		}
	}()
	return j.Run(ctx, s.db)
}

func (s *Scheduler) Start() {
	s.mu.RLock()
	sched := cron.New(cron.WithLocation(time.Local))
	var cronJobs []model.CronJob
	s.db.Where("is_enabled = ?", true).Find(&cronJobs)
	for _, cj := range cronJobs {
		key := cj.JobKey
		if j, ok := s.jobs[key]; ok {
			sched.AddFunc(j.Schedule(), func() {
				_ = s.exec(context.Background(), s.jobs[key])
			})
		}
	}
	s.mu.RUnlock()
	sched.Start()

	<-s.stop
	sched.Stop()
}

func (s *Scheduler) Stop() {
	select {
	case <-s.stop:
	default:
		close(s.stop)
	}
}

// Reload re-reads enabled jobs from the DB and restarts the cron tree.
func (s *Scheduler) Reload() {
	if s.cron != nil {
		s.cron.Stop()
	}
	s.cron = cron.New(cron.WithLocation(time.Local))
	var cronJobs []model.CronJob
	s.db.Where("is_enabled = ?", true).Find(&cronJobs)
	for _, cj := range cronJobs {
		key := cj.JobKey
		if j, ok := s.jobs[key]; ok {
			s.cron.AddFunc(j.Schedule(), func() {
				_ = s.exec(context.Background(), s.jobs[key])
			})
		}
	}
	s.cron.Start()
}
