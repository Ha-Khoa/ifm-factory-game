import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugMenuComponent } from './debug-menu.component';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

describe('DebugMenuComponent', () => {
  let component: DebugMenuComponent;
  let fixture: ComponentFixture<DebugMenuComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DebugMenuComponent],
      providers: [ApiService]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebugMenuComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setMoney on apiService when setMoney is called', () => {
    const money = 100;
    component.playerMoney = money;
    spyOn(apiService, 'setMoney').and.returnValue(of({}));
    component.setMoney();
    expect(apiService.setMoney).toHaveBeenCalledWith(component.playerName, money);
  });

  it('should call updateScore on apiService when setScore is called', () => {
    const score = 1000;
    component.playerScore = score;
    spyOn(apiService, 'updateScore').and.returnValue(of({}));
    component.setScore();
    expect(apiService.updateScore).toHaveBeenCalledWith(component.playerName, score);
  });
});
