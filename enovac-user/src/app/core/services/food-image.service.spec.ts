import { TestBed } from '@angular/core/testing';

import { FoodImageService } from './food-image.service';

describe('FoodImageService', () => {
  let service: FoodImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
