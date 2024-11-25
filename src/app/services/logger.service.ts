// logger.service.ts
import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  log(message: any, ...args: any[]) {
    if (!environment.production) {
      console.log(message, ...args);
    }
  }

  error(message: any, ...args: any[]) {
    if (!environment.production) {
      console.error(message, ...args);
    }
  }
}
