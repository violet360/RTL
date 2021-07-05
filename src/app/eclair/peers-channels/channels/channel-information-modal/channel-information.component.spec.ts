import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CommonService } from '../../../../shared/services/common.service';
import { LoggerService } from '../../../../shared/services/logger.service';

import { ECLChannelInformationComponent } from './channel-information.component';
import { SharedModule } from '../../../../shared/shared.module';
import { mockDataService, mockMatDialogRef } from '../../../../shared/test-helpers/test-consts';
import { DataService } from '../../../../shared/services/data.service';

describe('ECLChannelInformationComponent', () => {
  let component: ECLChannelInformationComponent;
  let fixture: ComponentFixture<ECLChannelInformationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ECLChannelInformationComponent ],
      imports: [ SharedModule ],
      providers: [ 
        LoggerService, CommonService,
        { provide: DataService, useClass: mockDataService },
        { provide: MatDialogRef, useClass: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {channel:{}} }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ECLChannelInformationComponent);
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
