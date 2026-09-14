import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private socketIdsPerUser = new Map<string, Set<string>>();

  /**
   * Add a listening socket for a given user, guaranteeing that they are online.
   *
   * @returns True if the socket was the first one, switching the user online.
   * False if the user was already online.
   */
  addSocket(userId: string, socketId: string) {
    if (this.socketIdsPerUser.has(userId) === false) {
      this.socketIdsPerUser.set(userId, new Set([socketId]));
      return true;
    } else {
      this.socketIdsPerUser.get(userId)?.add(socketId);
      return false;
    }
  }

  /**
   * Removes a user's listening sockets.
   *
   * @returns True if the socket was the last of the user. False otherwise, as
   * this will mean that the user is still online.
   */
  removeSocket(userId: string, socketId: string) {
    if (this.socketIdsPerUser.has(userId) === false) {
      return false;
    }
    if (
      this.socketIdsPerUser.get(userId)?.delete(socketId) &&
      this.socketIdsPerUser.get(userId)?.size === 0
    ) {
      this.socketIdsPerUser.delete(userId);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns whether a user is currently online, that is, whether it has active
   * sockets or not.
   */
  isOnline(userId: string) {
    const sockets = this.socketIdsPerUser.get(userId);
    if (!sockets || sockets.size === 0) {
      return false;
    } else {
      return true;
    }
  }
}
