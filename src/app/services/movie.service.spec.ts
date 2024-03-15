import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MovieService } from './movie.service';
import { HttpClientModule } from '@angular/common/http';

// Mock environment configuration
const mockEnvironment = {
  USE_STATIC_DATA: 'true'
};

describe('MovieService', () => {
  let service: MovieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MovieService,
        // Provide the mock environment
        { provide: 'environment', useValue: mockEnvironment }
      ],
      imports: [HttpClientModule],
    });
    service = TestBed.inject(MovieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return static data with synthetic delay when USE_STATIC_DATA is true', fakeAsync(() => {
    // Spy on the 'next' method of the BehaviorSubject to intercept its calls
    spyOn(service['searchResults'], 'next');

    // Execute the searchMovies method which should use static data
    service.searchMovies('The Godfather');
    
    // Expect no immediate emission
    expect(service['searchResults'].next).not.toHaveBeenCalled();

    // Simulate the delay
    tick(1000);

    // Now the emission should have happened
    expect(service['searchResults'].next).toHaveBeenCalled();
    expect(service['searchResults'].next).toHaveBeenCalledWith([
      // Expected static data here...
    ]);
  }));
});
