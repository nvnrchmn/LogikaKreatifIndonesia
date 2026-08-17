package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetPosts(c fiber.Ctx) error {
	var items []model.Post
	if err := model.DB.Order("created_at desc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func GetPostBySlug(c fiber.Ctx) error {
	slug := c.Params("slug")
	var post model.Post
	if err := model.DB.Where("slug = ?", slug).First(&post).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	return c.JSON(post)
}

func CreatePost(c fiber.Ctx) error {
	var input model.Post
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if input.AuthorID == 0 {
		input.AuthorID = 1
	}
	var dup model.Post
	if err := model.DB.Where("slug = ?", input.Slug).First(&dup).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{"error": "slug sudah digunakan, gunakan slug lain"})
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdatePost(c fiber.Ctx) error {
	id := c.Params("id")
	var input model.Post
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var p model.Post
	if err := model.DB.First(&p, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	var dup model.Post
	if err := model.DB.Where("slug = ? AND id <> ?", input.Slug, id).First(&dup).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{"error": "slug sudah digunakan, gunakan slug lain"})
	}
	p.Title = input.Title
	p.Slug = input.Slug
	p.Excerpt = input.Excerpt
	p.Body = input.Body
	p.FeaturedImage = input.FeaturedImage
	p.IsPublished = input.IsPublished
	model.DB.Save(&p)
	return c.JSON(p)
}

func DeletePost(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Post{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
