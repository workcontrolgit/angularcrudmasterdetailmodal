import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Position } from '@shared/models/position';
import { FormResult } from '@shared/models/form-result';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Logger } from '@core';

import { ApiHttpService } from '@app/services/api-http.service';
import { ApiEndpointsService } from '@app/services/api-endpoints.service';
import { ToastService } from '@app/services/toast.service';
import { ConfirmationDialogService } from '@app/services/confirmation-dialog.service';

const log = new Logger('ModalFormComponent');

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.scss'],
})
export class ModalFormComponent implements OnInit {
  @Input() public position: Position;
  @Input() public formMode: string = 'New';
  @Input() public isAddNew: boolean;

  entryForm: FormGroup;
  error: string | undefined;
  id: any;
  result: FormResult;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public toastService: ToastService,
    private apiHttpService: ApiHttpService,
    private apiEndpointsService: ApiEndpointsService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit() {
    this.createForm();
    log.debug('ngOnInit position:', this.position);
    log.debug('ngOnInit formMode:', this.formMode);
    log.debug('ngOnInit isAddNew:', this.isAddNew);
    if (this.position != undefined) {
      this.entryForm.setValue({
        id: this.position.id,
        positionNumber: this.position.positionNumber,
        positionTitle: this.position.positionTitle,
        positionDescription: this.position.positionDescription,
        positionSalary: this.position.positionSalary,
      });
    }
  }

  // CRUD > Update, map to REST/HTTP PUT
  put(id: string, formdata: any): void {
    this.apiHttpService.put(this.apiEndpointsService.putPositionsPagedEndpoint(id), formdata).subscribe(
      (resp: any) => {
        this.id = resp.data; //guid return in data
        if (this.entryForm.dirty) {
          this.position.id = this.entryForm.get('id').value;
          this.position.positionNumber = this.entryForm.get('positionNumber').value;
          this.position.positionTitle = this.entryForm.get('positionTitle').value;
          this.position.positionDescription = this.entryForm.get('positionDescription').value;
          this.position.positionSalary = this.entryForm.get('positionSalary').value;
          this.result = { position: this.position, crudType: 'u', status: true };
          // close the modal
          this.activeModal.close(this.result);
        }
      },
      (error) => {
        log.debug(error);
      }
    );
  }
  // CRUD > Delete, map to REST/HTTP DELETE
  delete(id: any): void {
    this.apiHttpService.delete(this.apiEndpointsService.deletePositionByIdEndpoint(id), id).subscribe(
      (resp: any) => {
        log.debug(resp);

        this.result = { position: this.position, crudType: 'd', status: true };
        this.activeModal.close(this.result);
      },
      (error) => {
        log.debug(error);
      }
    );
  }
  // CRUD > Create, map to REST/HTTP POST
  create(data: any): void {
    this.apiHttpService.post(this.apiEndpointsService.postPositionsEndpoint(), data).subscribe(
      (resp: any) => {
        this.id = resp.data; //guid return in data
        this.result = { position: this.position, crudType: 'c', status: true };
        this.activeModal.close(this.result);
      },
      (error) => {
        log.debug(error);
      }
    );
  }
  // Handle Create button click
  onCreate() {
    this.create(this.entryForm.value);
    log.debug('OnInsert: ', this.entryForm.value);
    log.debug('OnInsert: ', this.entryForm.get('positionNumber').value);
  }
  // Handle Update button click
  onUpdate({ value, valid }: { value: Position; valid: boolean }) {
    log.debug('onUpdate value', value);
    log.debug('onUpdate valid', valid);
    if (this.entryForm.dirty) {
      this.put(this.entryForm.get('id').value, this.entryForm.value);
    }
  }
  // Handle Delete button click
  onDelee() {
    this.confirmationDialogService
      .confirm('Position deletion', 'Are you sure you want to delete?')
      .then((confirmed) => {
        if (confirmed) {
          this.delete(this.entryForm.get('id').value);
          log.debug('onDelee: ', this.entryForm.value);
        }
      })
      .catch(() => {
        log.debug('onDelee: ', 'Cancel');
      });
  }

  // Handle Delete button click
  onCancel() {
    this.result = { position: this.position, crudType: '', status: true };
    this.activeModal.close(this.result);
  }

  // reactive form
  private createForm() {
    this.entryForm = this.formBuilder.group({
      id: [''],
      positionNumber: ['', Validators.required],
      positionTitle: ['', Validators.required],
      positionDescription: ['', Validators.required],
      positionSalary: ['', RxwebValidators.numeric({ allowDecimal: true, isFormat: false })],
    });
  }
}
