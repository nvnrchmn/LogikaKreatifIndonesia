package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

type HeroStat struct {
	ID        int    `json:"id" gorm:"column:id"`
	Num       string `json:"num" gorm:"num"`
	Label     string `json:"label" gorm:"label"`
	SortOrder int    `json:"sort_order" gorm:"column:sort_order"`
}

func GetHeroStats(c fiber.Ctx) error {
	var stats []HeroStat
	model.DB.Order("sort_order").Find(&stats)
	return c.JSON(fiber.Map{"data": stats})
}

func UpdateHeroStats(c fiber.Ctx) error {
	var stats []HeroStat
	if err := c.Bind().Body(&stats); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	for _, s := range stats {
		model.DB.Model(&HeroStat{}).Where("id = ?", s.ID).Updates(map[string]interface{}{
			"num":   s.Num,
			"label": s.Label,
		})
	}
	return c.JSON(fiber.Map{"message": "updated"})
}
