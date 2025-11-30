import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CulinariaOutput } from '../../../../core/api/models/culinaria-output';
import { CulinariaService } from '../../../../core/services/culinaria.service';

interface FilterOption {
    label: string;
    value: boolean | null;
}

@Component({
    selector: 'app-culinaria-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        TagModule,
        SelectModule,
        SkeletonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />

        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold m-0">Culinárias</h2>
            </div>

            <div class="flex justify-between items-center flex-column sm:flex-row gap-4 mb-4">
                <p-select
                    [options]="filterOptions"
                    [(ngModel)]="selectedFilter"
                    (ngModelChange)="onFilterChange()"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Filtrar por meio a meio"
                    [style]="{ 'min-width': '220px' }"
                />

                <p-iconfield iconPosition="left">
                    <p-inputicon>
                        <i class="pi pi-search"></i>
                    </p-inputicon>
                    <input
                        pInputText
                        type="text"
                        (input)="onGlobalFilter($event)"
                        placeholder="Buscar culinária..."
                    />
                </p-iconfield>
            </div>

            @if (loading()) {
                <div class="flex flex-col gap-4">
                    @for (i of [1, 2, 3, 4, 5]; track i) {
                        <p-skeleton height="3rem" />
                    }
                </div>
            } @else {
                <p-table
                    #dt
                    [value]="culinarias()"
                    [tableStyle]="{ 'min-width': '50rem' }"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[5, 10, 25, 50]"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} culinárias"
                    [globalFilterFields]="['nome']"
                >
                    <ng-template #header>
                        <tr>
                            <th pSortableColumn="id" style="width: 15%">
                                ID
                                <p-sortIcon field="id" />
                            </th>
                            <th pSortableColumn="nome" style="width: 60%">
                                Nome
                                <p-sortIcon field="nome" />
                            </th>
                            <th pSortableColumn="meioMeio" style="width: 25%">
                                Meio a Meio
                                <p-sortIcon field="meioMeio" />
                            </th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-culinaria>
                        <tr>
                            <td>
                                <span class="text-surface-500">{{ culinaria.id }}</span>
                            </td>
                            <td>
                                <span class="font-medium">{{ culinaria.nome }}</span>
                            </td>
                            <td>
                                @if (culinaria.meioMeio) {
                                    <p-tag value="Sim" severity="success" icon="pi pi-check" />
                                } @else {
                                    <p-tag value="Não" severity="secondary" icon="pi pi-times" />
                                }
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="3" class="text-center py-8">
                                <i class="pi pi-inbox text-4xl text-surface-300 mb-4"></i>
                                <p class="text-surface-500">Nenhuma culinária encontrada</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            }
        </div>
    `
})
export class CulinariaListComponent implements OnInit {
    @ViewChild('dt') dt!: Table;

    culinarias = signal<CulinariaOutput[]>([]);
    loading = signal(true);

    filterOptions: FilterOption[] = [
        { label: 'Todas', value: null },
        { label: 'Aceita Meio a Meio', value: true },
        { label: 'Não Aceita Meio a Meio', value: false }
    ];
    selectedFilter: boolean | null = null;

    constructor(
        private culinariaService: CulinariaService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadCulinarias();
    }

    loadCulinarias(): void {
        this.loading.set(true);
        const filter = this.selectedFilter;

        this.culinariaService.listar(filter ?? undefined).subscribe({
            next: (culinarias) => {
                this.culinarias.set(culinarias);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Erro ao carregar culinárias:', error);
                this.loading.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar culinárias'
                });
            }
        });
    }

    onFilterChange(): void {
        this.loadCulinarias();
    }

    onGlobalFilter(event: Event): void {
        this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
