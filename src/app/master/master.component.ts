import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';

import { Position } from '@shared/models/position';
import { ApiHttpService } from '@app/services/api-http.service';
import { ApiEndpointsService } from '@app/services/api-endpoints.service';
import { DataTablesResponse } from '@shared/classes/data-tables-response';
import { Logger } from '@core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFormComponent } from './modal-form/modal-form.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import { FormResult } from '@shared/models/form-result';

const log = new Logger('Master');
@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
})
export class MasterComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  //dtInstance: DataTables.Api;

  public position: Position;

  positions: Position[];

  constructor(
    private apiHttpService: ApiHttpService,
    private apiEndpointsService: ApiEndpointsService,
    public toastService: ToastService,
    public modalService: NgbModal
  ) {}

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      autoWidth: true,
      ajax: (dataTablesParameters: any, callback) => {
        // Call WebAPI to get positions
        this.apiHttpService
          .post(this.apiEndpointsService.postPositionsPagedEndpoint(), dataTablesParameters)
          .subscribe((resp: DataTablesResponse) => {
            this.positions = resp.data;
            //this.chRef.detectChanges();
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          });
      },
      // Set column title and data field
      columns: [
        {
          title: 'Number',
          data: 'positionNumber',
        },
        {
          title: 'Title',
          data: 'positionTitle',
        },
        {
          title: 'Description',
          data: 'positionDescription',
        },
        {
          title: 'Salary',
          data: 'positionSalary',
        },
      ],
    };
  }

  openModal(position: Position, formMode: string, isAddNew: boolean) {
    const modalRef = this.modalService.open(ModalFormComponent);
    modalRef.componentInstance.position = position;
    modalRef.componentInstance.formMode = formMode;
    modalRef.componentInstance.isAddNew = isAddNew;
    modalRef.result
      .then((result: FormResult) => {
        if (result) {
          log.debug('openModal', result);
          
          if (result.crudType=="u")
          {
            if (result.status)
            {
            // display modal
            this.showSuccess('Great job!', 'Data is updated');
            }
          }
          if (result.crudType=="d")
          {
            if (result.status)
            {
              
            this.refreshPage();
            // display toaster
            this.showSuccess('Great job!', 'Data is deleted');
            }
          }
          if (result.crudType=="c")
          {
            if (result.status)
            {
            this.refreshPage();
            // display toaster
            this.showSuccess('Great job!', 'Data is created');
            }
          }
          if (result.crudType=="")
          {
            this.showSuccess('Great job!', 'Form is cancel');
          }
        }
      })
      .catch(() => {
        log.debug('Form: ', 'Cancel');
      });
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refreshPage() {
    window.location.reload();
  }

  // ngbmodal service
  showSuccess(headerText: string, bodyText: string) {
    this.toastService.show(bodyText, {
      classname: 'bg-success text-light',
      delay: 2000,
      autohide: true,
      headertext: headerText,
    });
  }

}
