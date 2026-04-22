import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { convertToParamMap, provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MoviePageComponent } from './movie-page.component';

describe('MoviePageComponent', () => {
  let component: MoviePageComponent;
  let fixture: ComponentFixture<MoviePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoviePageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            paramMap: of(convertToParamMap({}))
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoviePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
