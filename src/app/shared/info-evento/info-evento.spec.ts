import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoEvento } from './info-evento';

describe('InfoEvento', () => {
  let component: InfoEvento;
  let fixture: ComponentFixture<InfoEvento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoEvento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoEvento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
