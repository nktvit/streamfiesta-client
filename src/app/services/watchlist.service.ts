import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { LoggerService } from './logger.service';
import {PbManagerService} from "./pbmanager.service"

export enum WatchStatus {
  NOT_WATCHED = 'NOT_WATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  WATCHED = 'WATCHED'
}

export interface WatchlistItem {
  id?: string;
  user?: string;
  imdbID: string;
  status: WatchStatus;
  created?: string;
  updated?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private watchlistSubject = new BehaviorSubject<WatchlistItem[]>([]);
  watchlist$ = this.watchlistSubject.asObservable();

  constructor(
    private pbManager: PbManagerService,
    private logger: LoggerService
  ) {}

  /**
   * Load the current user's watchlist
   */
  async loadWatchlist(): Promise<void> {
    if (!this.pbManager.isAuthenticated) {
      this.watchlistSubject.next([]);
      return;
    }

    try {
      const user = this.pbManager.currentUser;
      const records = await this.pbManager.instance.collection('watchlist').getFullList({
        filter: `user = "${user?.id}"`,
        sort: '-created'
      });

      const watchlist = records.map(record => this.mapRecordToWatchlistItem(record));
      this.watchlistSubject.next(watchlist);
      this.logger.log('Watchlist loaded', watchlist);
    } catch (error) {
      this.logger.error('Failed to load watchlist:', error);
      this.watchlistSubject.next([]);
    }
  }

  /**
   * Add a movie to the watchlist or update its status if it already exists
   */
  async addToWatchlist(imdbID: string, status: WatchStatus = WatchStatus.NOT_WATCHED): Promise<boolean> {
    if (!this.pbManager.isAuthenticated) {
      return false;
    }

    try {
      const user = this.pbManager.currentUser;

      // Check if movie is already in watchlist
      const existingItems = await this.pbManager.instance.collection('watchlist').getList(1, 1, {
        filter: `user = "${user?.id}" && imdbID = "${imdbID}"`
      });

      let record;

      if (existingItems.items.length > 0) {
        // Update existing item
        const existingItem = existingItems.items[0];
        record = await this.pbManager.instance.collection('watchlist').update(existingItem.id, {
          status: status
        });
        this.logger.log('Updated movie in watchlist', record);
      } else {
        // Create new item
        record = await this.pbManager.instance.collection('watchlist').create({
          user: user?.id,
          imdbID: imdbID,
          status: status
        });
        this.logger.log('Added movie to watchlist', record);
      }

      // Refresh watchlist
      await this.loadWatchlist();
      return true;
    } catch (error) {
      this.logger.error('Failed to add movie to watchlist:', error);
      return false;
    }
  }

  /**
   * Remove a movie from the watchlist
   */
  async removeFromWatchlist(imdbID: string): Promise<boolean> {
    if (!this.pbManager.isAuthenticated) {
      return false;
    }

    try {
      const user = this.pbManager.currentUser;

      // Find the item
      const existingItems = await this.pbManager.instance.collection('watchlist').getList(1, 1, {
        filter: `user = "${user?.id}" && imdbID = "${imdbID}"`
      });

      if (existingItems.items.length === 0) {
        this.logger.log('Movie not found in watchlist', imdbID);
        return false;
      }

      // Delete the item
      const existingItem = existingItems.items[0];
      await this.pbManager.instance.collection('watchlist').delete(existingItem.id);
      this.logger.log('Removed movie from watchlist', imdbID);

      // Refresh watchlist
      await this.loadWatchlist();
      return true;
    } catch (error) {
      this.logger.error('Failed to remove movie from watchlist:', error);
      return false;
    }
  }

  /**
   * Update the status of a movie in the watchlist
   */
  async updateStatus(imdbID: string, status: WatchStatus): Promise<boolean> {
    if (!this.pbManager.isAuthenticated) {
      return false;
    }

    try {
      const user = this.pbManager.currentUser;

      // Find the item
      const existingItems = await this.pbManager.instance.collection('watchlist').getList(1, 1, {
        filter: `user = "${user?.id}" && imdbID = "${imdbID}"`
      });

      if (existingItems.items.length === 0) {
        this.logger.log('Movie not found in watchlist', imdbID);
        return false;
      }

      // Update the item
      const existingItem = existingItems.items[0];
      await this.pbManager.instance.collection('watchlist').update(existingItem.id, {
        status: status
      });
      this.logger.log('Updated movie status in watchlist', imdbID, status);

      // Refresh watchlist
      await this.loadWatchlist();
      return true;
    } catch (error) {
      this.logger.error('Failed to update movie status in watchlist:', error);
      return false;
    }
  }

  /**
   * Check if a movie is in the watchlist
   * @returns WatchlistItem if found, null if not found
   */
  getWatchlistItem(imdbID: string): WatchlistItem | null {
    const watchlist = this.watchlistSubject.getValue();
    return watchlist.find(item => item.imdbID === imdbID) || null;
  }

  /**
   * Convert a PocketBase record to a WatchlistItem
   */
  private mapRecordToWatchlistItem(record: any): WatchlistItem {
    return {
      id: record.id,
      user: record.user,
      imdbID: record.imdbID,
      status: record.status as WatchStatus,
      created: record.created,
      updated: record.updated
    };
  }
}
