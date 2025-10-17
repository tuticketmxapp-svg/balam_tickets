import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionBoletos } from './seleccion-boletos';

describe('SeleccionBoletos', () => {
  let component: SeleccionBoletos;
  let fixture: ComponentFixture<SeleccionBoletos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionBoletos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionBoletos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
