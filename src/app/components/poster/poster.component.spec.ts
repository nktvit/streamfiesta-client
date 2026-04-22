import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { PosterComponent } from './poster.component';

describe('PosterComponent', () => {
  let component: PosterComponent;
  let fixture: ComponentFixture<PosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PosterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
