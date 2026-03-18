import { Component, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReportceComponent } from './Components/Imaging/ReportCE/reportce/reportce.component';



import { AutoFocusModule } from 'primeng/autofocus';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';

import { FocusTrapModule } from 'primeng/focustrap';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';

import { CarouselModule } from 'primeng/carousel';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DockModule } from 'primeng/dock';
import { DragDropModule } from 'primeng/dragdrop';

import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { InplaceModule } from 'primeng/inplace';
import { InputMaskModule } from 'primeng/inputmask';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup'
import { InputOtpModule } from 'primeng/inputotp'
import { ImageModule } from 'primeng/image';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';

import { MultiSelectModule } from 'primeng/multiselect';
import { MeterGroupModule } from 'primeng/metergroup';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';

import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { ScrollerModule } from 'primeng/scroller';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SelectButtonModule } from 'primeng/selectbutton';

import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
import { SpeedDialModule } from 'primeng/speeddial';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';

import { TableModule } from 'primeng/table';

import { TagModule } from 'primeng/tag';
import { TerminalModule } from 'primeng/terminal';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeTableModule } from 'primeng/treetable';
import { CardModule } from 'primeng/card';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { BiomedicaadminnavbarComponent } from './Components/navbars/biomedicaadminnavbar/biomedicaadminnavbar.component';
import { SuperadminnavbarComponent } from './Components/navbars/superadminnavbar/superadminnavbar.component';
import { BiomedicausernavbarComponent } from './Components/navbars/biomedicausernavbar/biomedicausernavbar.component';
import { BiomedicatecniconavbarComponent } from './Components/navbars/biomedicatecniconavbar/biomedicatecniconavbar.component';
import { MantenimientoadminnavbarComponent } from './Components/navbars/mantenimientoadminnavbar/mantenimientoadminnavbar.component';
import { MesaadminnavbarComponent } from './Components/navbars/mesaadminnavbar/mesaadminnavbar.component';
import { MesausernavbarComponent } from './Components/navbars/mesausernavbar/mesausernavbar.component';
import { SistemasadminnavbarComponent } from './Components/navbars/sistemasadminnavbar/sistemasadminnavbar.component';
import { UserService } from './Services/appServices/userServices/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { getDecodedAccessToken } from './utilidades';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ThemeService } from './Services/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,

    AvatarModule,
    AvatarGroupModule,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    AutoCompleteModule,
    BadgeModule,
    BreadcrumbModule,
    BlockUIModule,
    ButtonModule,
    CarouselModule,
    CascadeSelectModule,
    ChartModule,
    CheckboxModule,
    ChipModule,
    SpeedDialModule,
    ColorPickerModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    ContextMenuModule,
    DataViewModule,
    DialogModule,
    DividerModule,
    DockModule,
    DragDropModule,
    DynamicDialogModule,
    EditorModule,
    FieldsetModule,
    FileUploadModule,
    GalleriaModule,
    InplaceModule,
    InputMaskModule,
    InputTextModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputOtpModule,
    ImageModule,
    KnobModule,
    ListboxModule,
    MegaMenuModule,
    MenuModule,
    MenubarModule,
    MessageModule,
    MultiSelectModule,
    MeterGroupModule,
    OrganizationChartModule,
    OrderListModule,
    PaginatorModule,
    PanelModule,
    PanelMenuModule,
    PasswordModule,
    PickListModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    RadioButtonModule,
    RatingModule,
    SelectButtonModule,
    ScrollerModule,
    ScrollPanelModule,
    ScrollTopModule,
    SkeletonModule,
    SliderModule,
    SpeedDialModule,
    SplitterModule,
    StepperModule,
    SplitButtonModule,
    StepsModule,
    TableModule,
    TagModule,
    TerminalModule,
    TieredMenuModule,
    TimelineModule,
    ToastModule,
    ToggleButtonModule,
    ToolbarModule,
    TooltipModule,
    TreeModule,
    TreeSelectModule,
    TreeTableModule,
    CardModule,
    RippleModule,
    StyleClassModule,
    IconFieldModule,
    InputIconModule,
    AutoFocusModule,
    AnimateOnScrollModule,
    FocusTrapModule,
    FloatLabelModule,

    BiomedicaadminnavbarComponent,
    SuperadminnavbarComponent,
    BiomedicausernavbarComponent,
    BiomedicatecniconavbarComponent,
    MantenimientoadminnavbarComponent,
    MesaadminnavbarComponent,
    MesausernavbarComponent,
    SistemasadminnavbarComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'FrontAppHusrt';

  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  userService = inject(UserService);
  userRole: string = '';
  showNavbar: boolean = true;
  themeService = inject(ThemeService);
  isOffline: boolean = false;

  constructor() {
    this.themeService.applyTheme();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkUserRole();
      this.checkLoginRoute();
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkUserRole();
      this.checkLoginRoute();
      // Proactive check: if we have a token but it's expired, clear it and go to login
      if (sessionStorage.getItem('utoken') && !this.userService.isLoggedIn()) {
        sessionStorage.clear();
        this.router.navigate(['/login']);
      } else {
        this.userService.setupSessionTimer();
      }

      // Connectivity Listeners
      this.isOffline = !navigator.onLine;
      window.addEventListener('online', () => {
        this.isOffline = false;
      });
      window.addEventListener('offline', () => {
        this.isOffline = true;
      });
    }
  }

  checkLoginRoute() {
    const currentUrl = this.router.url;
    // Hide navbar on login page or basic root if no token
    if (currentUrl === '/login' || currentUrl === '/') {
      this.showNavbar = false;
      // If we are at root, maybe check token validity? For now, if root, hide.
      // Actually usually root redirects to login or home. 
      // Let's assume login page is /login.
    } else {
      this.showNavbar = true;
    }

    if (currentUrl.includes('login')) {
      this.showNavbar = false;
    }
  }

  checkUserRole() {
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem('utoken');
      if (token) {
        const decoded = getDecodedAccessToken();
        this.userRole = decoded?.rol || '';
      } else {
        this.userRole = '';
      }
    }
  }
}
