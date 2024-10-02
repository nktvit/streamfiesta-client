import { TestBed } from '@angular/core/testing';

import { VercelApiService } from './vercel-api.service';

describe('VercelApiServiceService', () => {
  let service: VercelApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VercelApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
