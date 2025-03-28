import { TestBed } from '@angular/core/testing';

import { PbmanagerService } from './pbmanager.service';

describe('PbmanagerService', () => {
  let service: PbmanagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PbmanagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
