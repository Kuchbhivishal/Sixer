import { users, players, matches, transactions, holdings } from "@shared/schema";
import type { User, InsertUser, Player, InsertPlayer, Match, InsertMatch, Transaction, InsertTransaction, Holding, InsertHolding } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Extend the IStorage interface with all the required methods
export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: Partial<InsertUser> & { referralCode?: string; referredBy?: number | null }): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  applyReferralBonus(referrerId: number, referredId: number): Promise<void>;
  
  // Player related methods
  getPlayer(id: number): Promise<Player | undefined>;
  getAllPlayers(): Promise<Player[]>;
  getTrendingPlayers(limit?: number): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, data: Partial<Player>): Promise<Player>;
  
  // Match related methods
  getMatch(id: number): Promise<Match | undefined>;
  getAllMatches(): Promise<Match[]>;
  getLiveMatches(): Promise<Match[]>;
  getUpcomingMatches(): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, data: Partial<Match>): Promise<Match>;
  
  // Transaction related methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // Holdings related methods
  getUserHoldings(userId: number): Promise<(Holding & { player: Player })[]>;
  getHolding(userId: number, playerId: number): Promise<Holding | undefined>;
  createOrUpdateHolding(holding: InsertHolding): Promise<Holding>;
  
  // Portfolio related methods
  getUserPortfolioSummary(userId: number): Promise<{ 
    portfolioValue: number;
    balance: number;
    growth: number;
    growthPercentage: number;
  }>;
  
  // Trading related methods
  executeTrade(userId: number, playerId: number, type: 'BUY' | 'SELL', quantity: number, price: number): Promise<{
    transaction: Transaction;
    holding?: Holding;
    user: User;
  }>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private matches: Map<number, Match>;
  private transactions: Map<number, Transaction>;
  private holdings: Map<string, Holding>; // Composite key: userId-playerId
  private nextIds: {
    users: number;
    players: number;
    matches: number;
    transactions: number;
    holdings: number;
  };
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.matches = new Map();
    this.transactions = new Map();
    this.holdings = new Map();
    this.nextIds = {
      users: 1,
      players: 1,
      matches: 1,
      transactions: 1,
      holdings: 1
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
    
    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode,
    );
  }

  async createUser(userData: Partial<InsertUser> & { referralCode?: string; referredBy?: number | null }): Promise<User> {
    const id = this.nextIds.users++;
    const now = new Date();
    
    const user: User = {
      id,
      username: userData.username!,
      password: userData.password!,
      email: userData.email!,
      fullName: userData.fullName || null,
      balance: 10000, // Default starting balance
      portfolioValue: 0,
      referralCode: userData.referralCode || null,
      referredBy: userData.referredBy || null,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async applyReferralBonus(referrerId: number, referredId: number): Promise<void> {
    // Award bonus to both referrer and referred user
    const referrer = await this.getUser(referrerId);
    const referred = await this.getUser(referredId);
    
    if (referrer && referred) {
      // Add 500 to both users' balances
      await this.updateUser(referrerId, { balance: referrer.balance + 500 });
      await this.updateUser(referredId, { balance: referred.balance + 500 });
    }
  }

  // Player related methods
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getTrendingPlayers(limit: number = 10): Promise<Player[]> {
    // Sort players by absolute price change percentage in descending order
    const sortedPlayers = Array.from(this.players.values()).sort(
      (a, b) => Math.abs(b.priceChangePercentage) - Math.abs(a.priceChangePercentage)
    );
    
    return sortedPlayers.slice(0, limit);
  }

  async createPlayer(playerData: InsertPlayer): Promise<Player> {
    const id = this.nextIds.players++;
    
    const player: Player = {
      id,
      name: playerData.name,
      team: playerData.team,
      role: playerData.role,
      currentPrice: playerData.currentPrice,
      priceChange: 0,
      priceChangePercentage: 0,
      stats: playerData.stats,
      imageUrl: playerData.imageUrl || null,
      teamImageUrl: playerData.teamImageUrl || null
    };
    
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, data: Partial<Player>): Promise<Player> {
    const player = await this.getPlayer(id);
    if (!player) {
      throw new Error(`Player with id ${id} not found`);
    }
    
    // Calculate price change if current price is updated
    if (data.currentPrice !== undefined && data.currentPrice !== player.currentPrice) {
      const oldPrice = player.currentPrice;
      const newPrice = data.currentPrice;
      
      data.priceChange = newPrice - oldPrice;
      data.priceChangePercentage = (data.priceChange / oldPrice) * 100;
      
      // Update holdings with new values
      this.updateHoldingsForPriceChange(id, newPrice);
    }
    
    const updatedPlayer = { ...player, ...data };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  private async updateHoldingsForPriceChange(playerId: number, newPrice: number): Promise<void> {
    // Find all holdings for this player and update their values
    for (const [key, holding] of this.holdings.entries()) {
      if (holding.playerId === playerId) {
        const newValue = holding.quantity * newPrice;
        const profitLoss = newValue - (holding.quantity * holding.averageBuyPrice);
        const profitLossPercentage = (profitLoss / (holding.quantity * holding.averageBuyPrice)) * 100;
        
        const updatedHolding: Holding = {
          ...holding,
          currentValue: newValue,
          profitLoss,
          profitLossPercentage
        };
        
        this.holdings.set(key, updatedHolding);
        
        // Update user's portfolio value
        const user = await this.getUser(holding.userId);
        if (user) {
          // Recalculate total portfolio value
          const portfolioValue = await this.calculateUserPortfolioValue(user.id);
          await this.updateUser(user.id, { portfolioValue });
        }
      }
    }
  }

  // Match related methods
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getAllMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }

  async getLiveMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      match => match.status === 'LIVE'
    );
  }

  async getUpcomingMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      match => match.status === 'UPCOMING'
    );
  }

  async createMatch(matchData: InsertMatch): Promise<Match> {
    const id = this.nextIds.matches++;
    
    const match: Match = {
      id,
      team1: matchData.team1,
      team2: matchData.team2,
      team1Score: matchData.team1Score || null,
      team2Score: matchData.team2Score || null,
      status: matchData.status,
      venue: matchData.venue || null,
      tournament: matchData.tournament || null,
      startTime: matchData.startTime,
      currentOver: matchData.currentOver || null,
      matchInfo: matchData.matchInfo || null
    };
    
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: number, data: Partial<Match>): Promise<Match> {
    const match = await this.getMatch(id);
    if (!match) {
      throw new Error(`Match with id ${id} not found`);
    }
    
    const updatedMatch = { ...match, ...data };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  // Transaction related methods
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.nextIds.transactions++;
    const now = new Date();
    
    const transaction: Transaction = {
      id,
      userId: transactionData.userId,
      playerId: transactionData.playerId,
      type: transactionData.type,
      quantity: transactionData.quantity,
      price: transactionData.price,
      total: transactionData.total,
      timestamp: now
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.userId === userId
    );
  }

  // Holdings related methods
  async getUserHoldings(userId: number): Promise<(Holding & { player: Player })[]> {
    const userHoldings = Array.from(this.holdings.values()).filter(
      holding => holding.userId === userId
    );
    
    // Attach player data to each holding
    const holdingsWithPlayerData = await Promise.all(
      userHoldings.map(async holding => {
        const player = await this.getPlayer(holding.playerId);
        return {
          ...holding,
          player: player!
        };
      })
    );
    
    return holdingsWithPlayerData;
  }

  async getHolding(userId: number, playerId: number): Promise<Holding | undefined> {
    return this.holdings.get(`${userId}-${playerId}`);
  }

  async createOrUpdateHolding(holdingData: InsertHolding): Promise<Holding> {
    const key = `${holdingData.userId}-${holdingData.playerId}`;
    const existingHolding = this.holdings.get(key);
    
    if (existingHolding) {
      // Update existing holding
      const updatedHolding: Holding = {
        ...existingHolding,
        quantity: holdingData.quantity,
        averageBuyPrice: holdingData.averageBuyPrice,
        currentValue: holdingData.currentValue,
        profitLoss: holdingData.currentValue - (holdingData.quantity * holdingData.averageBuyPrice),
        profitLossPercentage: (holdingData.currentValue - (holdingData.quantity * holdingData.averageBuyPrice)) / 
                            (holdingData.quantity * holdingData.averageBuyPrice) * 100
      };
      
      this.holdings.set(key, updatedHolding);
      return updatedHolding;
    } else {
      // Create new holding
      const id = this.nextIds.holdings++;
      
      const holding: Holding = {
        id,
        userId: holdingData.userId,
        playerId: holdingData.playerId,
        quantity: holdingData.quantity,
        averageBuyPrice: holdingData.averageBuyPrice,
        currentValue: holdingData.currentValue,
        profitLoss: holdingData.currentValue - (holdingData.quantity * holdingData.averageBuyPrice),
        profitLossPercentage: (holdingData.currentValue - (holdingData.quantity * holdingData.averageBuyPrice)) / 
                            (holdingData.quantity * holdingData.averageBuyPrice) * 100
      };
      
      this.holdings.set(key, holding);
      return holding;
    }
  }

  // Portfolio related methods
  async calculateUserPortfolioValue(userId: number): Promise<number> {
    const userHoldings = Array.from(this.holdings.values()).filter(
      holding => holding.userId === userId
    );
    
    let portfolioValue = 0;
    for (const holding of userHoldings) {
      portfolioValue += holding.currentValue;
    }
    
    return portfolioValue;
  }

  async getUserPortfolioSummary(userId: number): Promise<{ 
    portfolioValue: number;
    balance: number;
    growth: number;
    growthPercentage: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    // Calculate total investment
    const transactions = await this.getUserTransactions(userId);
    let totalInvestment = 0;
    let totalSold = 0;
    
    for (const transaction of transactions) {
      if (transaction.type === 'BUY') {
        totalInvestment += transaction.total;
      } else if (transaction.type === 'SELL') {
        totalSold += transaction.total;
      }
    }
    
    const netInvestment = totalInvestment - totalSold;
    const portfolioValue = await this.calculateUserPortfolioValue(userId);
    
    // Calculate growth and growth percentage
    const growth = netInvestment > 0 ? portfolioValue - netInvestment : portfolioValue;
    const growthPercentage = netInvestment > 0 ? (growth / netInvestment) * 100 : 0;
    
    return {
      portfolioValue,
      balance: user.balance,
      growth,
      growthPercentage
    };
  }

  // Trading related methods
  async executeTrade(userId: number, playerId: number, type: 'BUY' | 'SELL', quantity: number, price: number): Promise<{
    transaction: Transaction;
    holding?: Holding;
    user: User;
  }> {
    // Get user and player
    const user = await this.getUser(userId);
    const player = await this.getPlayer(playerId);
    
    if (!user || !player) {
      throw new Error(`User or player not found`);
    }
    
    const totalAmount = quantity * price;
    
    if (type === 'BUY') {
      // Check if user has enough balance
      if (user.balance < totalAmount) {
        throw new Error('Insufficient balance');
      }
      
      // Create transaction
      const transaction = await this.createTransaction({
        userId,
        playerId,
        type,
        quantity,
        price,
        total: totalAmount
      });
      
      // Update user balance
      const updatedUser = await this.updateUser(userId, { 
        balance: user.balance - totalAmount,
      });
      
      // Update or create holding
      const existingHolding = await this.getHolding(userId, playerId);
      let holding: Holding;
      
      if (existingHolding) {
        // Calculate new average buy price
        const totalValue = existingHolding.averageBuyPrice * existingHolding.quantity + totalAmount;
        const newQuantity = existingHolding.quantity + quantity;
        const newAverageBuyPrice = totalValue / newQuantity;
        
        holding = await this.createOrUpdateHolding({
          userId,
          playerId,
          quantity: newQuantity,
          averageBuyPrice: newAverageBuyPrice,
          currentValue: newQuantity * player.currentPrice
        });
      } else {
        holding = await this.createOrUpdateHolding({
          userId,
          playerId,
          quantity,
          averageBuyPrice: price,
          currentValue: quantity * player.currentPrice
        });
      }
      
      // Update user's portfolio value
      const portfolioValue = await this.calculateUserPortfolioValue(userId);
      const finalUser = await this.updateUser(userId, { portfolioValue });
      
      return {
        transaction,
        holding,
        user: finalUser
      };
    } else if (type === 'SELL') {
      // Check if user has the holding and enough quantity
      const existingHolding = await this.getHolding(userId, playerId);
      if (!existingHolding || existingHolding.quantity < quantity) {
        throw new Error('Insufficient holdings');
      }
      
      // Create transaction
      const transaction = await this.createTransaction({
        userId,
        playerId,
        type,
        quantity,
        price,
        total: totalAmount
      });
      
      // Update user balance
      const updatedUser = await this.updateUser(userId, { 
        balance: user.balance + totalAmount,
      });
      
      // Update holding
      const newQuantity = existingHolding.quantity - quantity;
      let holding: Holding | undefined;
      
      if (newQuantity > 0) {
        // Keep the same average buy price
        holding = await this.createOrUpdateHolding({
          userId,
          playerId,
          quantity: newQuantity,
          averageBuyPrice: existingHolding.averageBuyPrice,
          currentValue: newQuantity * player.currentPrice
        });
      } else {
        // Remove the holding if quantity is 0
        this.holdings.delete(`${userId}-${playerId}`);
      }
      
      // Update user's portfolio value
      const portfolioValue = await this.calculateUserPortfolioValue(userId);
      const finalUser = await this.updateUser(userId, { portfolioValue });
      
      return {
        transaction,
        holding,
        user: finalUser
      };
    } else {
      throw new Error(`Invalid trade type: ${type}`);
    }
  }

  // Initialize with sample data for development
  private async initializeSampleData() {
    // Sample user data
    await this.createUser({
      username: 'demo',
      email: 'demo@example.com',
      password: 'demo123',
      fullName: 'Demo User',
      balance: 10000
    });

    // Sample players
    const viratKohli = await this.createPlayer({
      name: 'Virat Kohli',
      team: 'India',
      role: 'Batsman',
      imageUrl: 'https://resources.pulse.icc-cricket.com/players/284/164.png',
      initialPrice: 500,
      currentPrice: 550,
      priceChange: 50,
      priceChangePercentage: 10,
      trend: 'UP',
      statistics: {
        matches: 102,
        runs: 8074,
        average: 49.3,
        strikeRate: 138.4,
        centuries: 30,
        fifties: 28
      }
    });

    const rohitSharma = await this.createPlayer({
      name: 'Rohit Sharma',
      team: 'India',
      role: 'Batsman',
      imageUrl: 'https://resources.pulse.icc-cricket.com/players/284/107.png',
      initialPrice: 480,
      currentPrice: 510,
      priceChange: 30,
      priceChangePercentage: 6.25,
      trend: 'UP',
      statistics: {
        matches: 145,
        runs: 7039,
        average: 45.4,
        strikeRate: 139.1,
        centuries: 5,
        fifties: 29
      }
    });

    const jaspritBumrah = await this.createPlayer({
      name: 'Jasprit Bumrah',
      team: 'India',
      role: 'Bowler',
      imageUrl: 'https://resources.pulse.icc-cricket.com/players/284/1124.png',
      initialPrice: 450,
      currentPrice: 490,
      priceChange: 40,
      priceChangePercentage: 8.89,
      trend: 'UP',
      statistics: {
        matches: 67,
        wickets: 148,
        economy: 6.6,
        average: 19.3,
        bestBowling: '5/27',
        fiveWickets: 1
      }
    });

    // Sample matches
    await this.createMatch({
      team1: 'India',
      team2: 'Australia',
      team1Score: '186/5',
      team2Score: '150/8',
      status: 'LIVE',
      venue: 'Melbourne Cricket Ground',
      tournament: 'T20 World Cup',
      startTime: new Date(),
      currentOver: '15.2',
      matchInfo: 'India needs 35 runs from 28 balls'
    });

    await this.createMatch({
      team1: 'England',
      team2: 'South Africa',
      team1Score: '210/4',
      team2Score: '120/3',
      status: 'LIVE',
      venue: 'Lord\'s Cricket Ground',
      tournament: 'T20 Series',
      startTime: new Date(),
      currentOver: '10.4',
      matchInfo: 'South Africa needs 91 runs from 56 balls'
    });

    await this.createMatch({
      team1: 'Pakistan',
      team2: 'New Zealand',
      team1Score: '175/6',
      team2Score: '180/4',
      status: 'COMPLETED',
      venue: 'Dubai International Stadium',
      tournament: 'Test Series',
      startTime: new Date(Date.now() - 3600000),
      matchInfo: 'New Zealand won by 6 wickets'
    });
  }
}

export const storage = new MemStorage();
