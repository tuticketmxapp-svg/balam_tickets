import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoBoleto } from './pago-boleto';

describe('PagoBoleto', () => {
  let component: PagoBoleto;
  let fixture: ComponentFixture<PagoBoleto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoBoleto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoBoleto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
