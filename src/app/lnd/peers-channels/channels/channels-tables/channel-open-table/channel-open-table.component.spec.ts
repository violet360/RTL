import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { RTLReducer } from '../../../../../store/rtl.reducers';
import { CommonService } from '../../../../../shared/services/common.service';
import { LoggerService } from '../../../../../shared/services/logger.service';
import { LoopService } from '../../../../../shared/services/loop.service';

import { ChannelOpenTableComponent } from './channel-open-table.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { mockDataService, mockLNDEffects, mockRTLEffects } from '../../../../../shared/test-helpers/test-consts';
import { RTLEffects } from '../../../../../store/rtl.effects';
import { LNDEffects } from '../../../../store/lnd.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataService } from '../../../../../shared/services/data.service';

describe('ChannelOpenTableComponent', () => {
  let component: ChannelOpenTableComponent;
  let fixture: ComponentFixture<ChannelOpenTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelOpenTableComponent ],
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        StoreModule.forRoot(RTLReducer, {
          runtimeChecks: {
            strictStateImmutability: false,
            strictActionImmutability: false
          }
        })
      ],
      providers: [ 
        LoggerService, CommonService, LoopService,
        { provide: DataService, useClass: mockDataService },
        { provide: RTLEffects, useClass: mockRTLEffects },
        { provide: LNDEffects, useClass: mockLNDEffects }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ChannelOpenTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

});
