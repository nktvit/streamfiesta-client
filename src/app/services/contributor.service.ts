import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, finalize, map, Observable, of, throwError} from "rxjs";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {IContributorFetch} from "../interfaces/IContributorFetch";
import {INewContributor} from "../interfaces/INewContributor";
import {LoggerService} from "./logger.service";

@Injectable({
  providedIn: 'root'
})

export class ContributorService {
  constructor(private http: HttpClient, private logger: LoggerService) {
  }

  getContributors(): Observable<IContributorFetch[]> {
    return this.http.get<IContributorFetch[]>(`${environment.BACKEND_URL}/contributions`)
      .pipe(
        finalize(() => {
        }),
        catchError(error => {
          this.handleError(error);
          return of([]);
        })
      );
  }

  createContribution(data: INewContributor): Observable<boolean> {
    return this.http.post<INewContributor>(`${environment.BACKEND_URL}/contribution`, {data})
      .pipe(
        finalize(() => {
          this.logger.log('Contribution request completed.');
        }),
        catchError(error => {
          this.handleError(error);
          return throwError(() => error); // Re-throw error
        }),
        // Map the response to a boolean (true for success)
        map(() => true)
      );
  }


  private handleError(err: HttpErrorResponse) {
    return throwError(() => new Error("contributor service:" + err.message))
  }
}
