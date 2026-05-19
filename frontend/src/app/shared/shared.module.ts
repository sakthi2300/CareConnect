import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';

import { UserProfileComponent } from './user-profile.component';

const MATERIAL_MODULES = [
  MatToolbarModule,
  MatSidenavModule,
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatChipsModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatBadgeModule,
  MatTabsModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatDividerModule,
  MatTooltipModule,
  MatMenuModule,
  MatSelectModule,
  MatRippleModule,
  MatDialogModule
];

@NgModule({
  declarations: [
    UserProfileComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    UserProfileComponent,
    ...MATERIAL_MODULES
  ]
})
export class SharedModule { }
