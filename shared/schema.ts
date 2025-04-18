import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  balance: real("balance").notNull().default(10000), // Initial balance of 10,000
  portfolioValue: real("portfolio_value").notNull().default(0), // Initial portfolio value
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  referredBy: true,
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  team: text("team").notNull(),
  role: text("role").notNull(), // Batsman, Bowler, All-rounder, etc.
  currentPrice: real("current_price").notNull(),
  priceChange: real("price_change").notNull().default(0),
  priceChangePercentage: real("price_change_percentage").notNull().default(0),
  stats: json("stats").notNull(), // JSON object with player stats
  imageUrl: text("image_url"),
  teamImageUrl: text("team_image_url"),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  team: true,
  role: true,
  currentPrice: true,
  stats: true,
  imageUrl: true,
  teamImageUrl: true,
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  team1: text("team1").notNull(),
  team2: text("team2").notNull(),
  team1Score: text("team1_score"),
  team2Score: text("team2_score"),
  status: text("status").notNull(), // LIVE, UPCOMING, COMPLETED
  venue: text("venue"),
  tournament: text("tournament"),
  startTime: timestamp("start_time").notNull(),
  currentOver: text("current_over"),
  matchInfo: text("match_info"), // Additional match information like "CSK needs 40 runs in 10 balls"
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  team1: true,
  team2: true,
  team1Score: true,
  team2Score: true,
  status: true,
  venue: true,
  tournament: true,
  startTime: true,
  currentOver: true,
  matchInfo: true,
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  type: text("type").notNull(), // BUY, SELL
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(), // Price per stock at time of transaction
  total: real("total").notNull(), // Total transaction value
  timestamp: timestamp("timestamp").defaultNow()
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  playerId: true,
  type: true,
  quantity: true,
  price: true,
  total: true,
});

export const holdings = pgTable("holdings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  quantity: integer("quantity").notNull(),
  averageBuyPrice: real("average_buy_price").notNull(),
  currentValue: real("current_value").notNull(),
  profitLoss: real("profit_loss").notNull().default(0),
  profitLossPercentage: real("profit_loss_percentage").notNull().default(0)
});

export const insertHoldingSchema = createInsertSchema(holdings).pick({
  userId: true,
  playerId: true,
  quantity: true,
  averageBuyPrice: true,
  currentValue: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type Holding = typeof holdings.$inferSelect;
