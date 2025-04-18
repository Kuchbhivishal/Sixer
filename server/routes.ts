import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSocket } from "./websocket";
import { getCurrentMatches } from "./services/cricket-api";
import { insertPlayerSchema, insertMatchSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocket(httpServer);

  // Players API
  app.get("/api/players", async (req, res, next) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/players/trending", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const players = await storage.getTrendingPlayers(limit);
      res.json(players);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/players/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const player = await storage.getPlayer(id);
      
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      res.json(player);
    } catch (error) {
      next(error);
    }
  });

  // Matches API
  app.get("/api/matches", async (req, res, next) => {
    try {
      const matches = await storage.getAllMatches();
      res.json(matches);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/matches/live", async (req, res, next) => {
    try {
      const matches = await storage.getLiveMatches();
      res.json(matches);
    } catch (error) {
      next(error);
    }
  });
  
  // Cricket API Test Endpoint - Get real cricket matches
  app.get("/api/cricket/matches", async (req, res, next) => {
    try {
      const matches = await getCurrentMatches();
      res.json({ 
        success: true, 
        count: matches.length,
        matches
      });
    } catch (error) {
      console.error("Error in /api/cricket/matches endpoint:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/matches/upcoming", async (req, res, next) => {
    try {
      const matches = await storage.getUpcomingMatches();
      res.json(matches);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/matches/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const match = await storage.getMatch(id);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      res.json(match);
    } catch (error) {
      next(error);
    }
  });

  // User portfolio API
  app.get("/api/portfolio", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const portfolioSummary = await storage.getUserPortfolioSummary(req.user.id);
      res.json(portfolioSummary);
    } catch (error) {
      next(error);
    }
  });

  // User holdings API
  app.get("/api/holdings", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const holdings = await storage.getUserHoldings(req.user.id);
      res.json(holdings);
    } catch (error) {
      next(error);
    }
  });

  // Transactions API
  app.get("/api/transactions", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  // Trading API
  const tradeSchema = z.object({
    playerId: z.number(),
    type: z.enum(['BUY', 'SELL']),
    quantity: z.number().int().positive(),
  });

  app.post("/api/trade", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { playerId, type, quantity } = tradeSchema.parse(req.body);
      
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      const result = await storage.executeTrade(
        req.user.id,
        playerId,
        type,
        quantity,
        player.currentPrice
      );
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Admin routes - in a real app would be protected by admin-only middleware
  // For MVP purposes, these are exposed for testing
  
  app.post("/api/admin/players", async (req, res, next) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  app.put("/api/admin/players/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const playerData = req.body;
      const player = await storage.updatePlayer(id, playerData);
      res.json(player);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/admin/matches", async (req, res, next) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });
  
  app.put("/api/admin/matches/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const matchData = req.body;
      const match = await storage.updateMatch(id, matchData);
      res.json(match);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
