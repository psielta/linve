import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Início',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app'] }]
            },
            {
                label: 'Gestão',
                items: [
                    { label: 'Tarefas', icon: 'pi pi-fw pi-check-square', routerLink: ['/app/todos'] },
                    { label: 'Culinárias', icon: 'pi pi-fw pi-th-large', routerLink: ['/app/culinarias'] },
                    { label: 'Categorias', icon: 'pi pi-fw pi-sitemap', routerLink: ['/app/categorias'] },
                    { label: 'Produtos', icon: 'pi pi-fw pi-box', routerLink: ['/app/produtos'] },
                    { label: 'Adicionais', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/app/adicionais'] }
                ]
            },
            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/app/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/app/uikit/input'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/app/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/app/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/app/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/app/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/app/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/app/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/app/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/app/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/app/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/app/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/app/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/app/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/app/uikit/misc'] }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    { label: 'Landing', icon: 'pi pi-fw pi-globe', routerLink: ['/'] },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            { label: 'Login', icon: 'pi pi-fw pi-sign-in', routerLink: ['/auth/login'] },
                            { label: 'Register', icon: 'pi pi-fw pi-user-plus', routerLink: ['/auth/register'] },
                            { label: 'Error', icon: 'pi pi-fw pi-times-circle', routerLink: ['/auth/error'] },
                            { label: 'Access Denied', icon: 'pi pi-fw pi-lock', routerLink: ['/auth/access'] }
                        ]
                    },
                    { label: 'Crud', icon: 'pi pi-fw pi-pencil', routerLink: ['/app/pages/crud'] },
                    { label: 'Not Found', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/notfound'] },
                    { label: 'Empty', icon: 'pi pi-fw pi-circle-off', routerLink: ['/app/pages/empty'] }
                ]
            },
            {
                label: 'Hierarchy',
                items: [
                    {
                        label: 'Submenu 1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 1.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 1.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    },
                    {
                        label: 'Submenu 2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 2.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 2.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Get Started',
                items: [
                    { label: 'Documentation', icon: 'pi pi-fw pi-book', routerLink: ['/app/documentation'] },
                    { label: 'View Source', icon: 'pi pi-fw pi-github', url: 'https://github.com/primefaces/sakai-ng', target: '_blank' }
                ]
            }
        ];
    }
}




