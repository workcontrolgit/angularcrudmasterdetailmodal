import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '@shared';
import { MasterRoutingModule } from './master-routing.module';
import { MasterComponent } from './master.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModalFormComponent } from './modal-form/modal-form.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    MasterRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [MasterComponent, ModalFormComponent],
})
export class MasterModule {}
