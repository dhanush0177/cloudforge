package store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

type Redis struct {
	Client *redis.Client
}

func NewRedis(addr, password string, db int) *Redis {
	options := &redis.Options{
		Addr:        addr,
		Password:    password,
		DB:          db,
		DialTimeout: 5 * time.Second,
		MaxRetries:  3,
	}

	if strings.Contains(addr, "://") {
		if parsed, err := redis.ParseURL(addr); err == nil {
			options = parsed
			options.DialTimeout = 5 * time.Second
			options.MaxRetries = 3
		}
	}

	return &Redis{Client: redis.NewClient(options)}
}

func (r *Redis) Ping(ctx context.Context) error {
	if err := r.Client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis ping: %w", err)
	}
	return nil
}

func (r *Redis) Close() error {
	return r.Client.Close()
}
