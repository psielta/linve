import { Component } from '@angular/core';

@Component({
    selector: 'highlights-widget',
    template: `
        <div id="highlights" class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20">
            <div class="text-center">
                <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Acesse de Qualquer Lugar</div>
                <span class="text-muted-color text-2xl">Sistema responsivo para desktop e mobile</span>
            </div>

            <div class="grid grid-cols-12 gap-4 mt-20 pb-2 md:pb-20">
                <div class="flex justify-center col-span-12 lg:col-span-6 p-0 order-1 lg:order-0" style="border-radius: 8px; background: color-mix(in srgb, var(--primary-color) 15%, white)">
                    <img src="https://primefaces.org/cdn/templates/sakai/landing/mockup.png" class="w-11/12" alt="mockup mobile" />
                </div>

                <div class="col-span-12 lg:col-span-6 my-auto flex flex-col lg:items-end text-center lg:text-right gap-4">
                    <div class="flex items-center justify-center self-center lg:self-end" style="width: 4.2rem; height: 4.2rem; border-radius: 10px; background: color-mix(in srgb, var(--primary-color) 25%, white)">
                        <i class="pi pi-fw pi-mobile text-4xl! text-primary"></i>
                    </div>
                    <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">Aplicativo Mobile</div>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal ml-0 md:ml-2" style="max-width: 650px"
                        >Gerencie seu negócio de qualquer lugar. Receba notificações de novos pedidos, acompanhe entregas e monitore vendas diretamente do seu celular.</span
                    >
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4 my-20 pt-2 md:pt-20">
                <div class="col-span-12 lg:col-span-6 my-auto flex flex-col text-center lg:text-left lg:items-start gap-4">
                    <div class="flex items-center justify-center self-center lg:self-start" style="width: 4.2rem; height: 4.2rem; border-radius: 10px; background: color-mix(in srgb, var(--primary-color) 25%, white)">
                        <i class="pi pi-fw pi-desktop text-3xl! text-primary"></i>
                    </div>
                    <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">Dashboard Completo</div>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal mr-0 md:mr-2" style="max-width: 650px"
                        >Painel administrativo completo para gerenciar pedidos, cardápio, clientes e relatórios. Interface intuitiva e moderna com tema claro e escuro.</span
                    >
                </div>

                <div class="flex justify-end order-1 sm:order-2 col-span-12 lg:col-span-6 p-0" style="border-radius: 8px; background: color-mix(in srgb, var(--primary-color) 15%, white)">
                    <img src="https://primefaces.org/cdn/templates/sakai/landing/mockup-desktop.png" class="w-11/12" alt="mockup" />
                </div>
            </div>
        </div>
    `
})
export class HighlightsWidget {}
