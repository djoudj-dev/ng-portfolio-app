import {
  Component,
  ChangeDetectionStrategy,
  input,
  viewChild,
  ElementRef,
  OnDestroy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import type { VisitStats } from '@features/analytics';

Chart.register(...registerables);

@Component({
  selector: 'app-timeline-chart',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full">
      <canvas #chartCanvas class="w-full h-full"></canvas>
    </div>
  `,
})
export class TimelineChartComponent implements OnDestroy {
  readonly chartCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');

  readonly data = input<VisitStats[]>([]);
  readonly title = input<string>('Évolution des visites');

  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      const canvas = this.chartCanvas();
      const chartData = this.data();

      if (canvas) {
        if (!this.chart) {
          this.initChart();
        } else if (chartData) {
          this.updateChart(chartData);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initChart(): void {
    const ctx = this.chartCanvas().nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData = this.data();
    const processedData = this.processData(chartData);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: processedData.labels,
        datasets: [
          {
            label: 'Visites totales',
            data: processedData.visits,
            borderColor: 'var(--color-primary-500)',
            backgroundColor: 'var(--color-primary-100)',
            borderWidth: 1,
          },
          {
            label: 'Visiteurs uniques',
            data: processedData.uniqueVisitors,
            borderColor: 'var(--color-accent-500)',
            backgroundColor: 'var(--color-accent-100)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          title: {
            display: true,
            text: this.title(),
            font: {
              size: 16,
              weight: 'bold',
            },
            color: '#374151',
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgb(243, 130, 29)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8,
            padding: 12,
            displayColors: true,
            callbacks: {
              title: (context) => {
                return context[0]?.label ?? '';
              },
              label: (context) => {
                const label = context.dataset.label ?? '';
                const value = context.parsed.y;
                return `${label}: ${value.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                size: 11,
              },
              color: '#6b7280',
              maxTicksLimit: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                size: 11,
              },
              color: '#6b7280',
              callback(value) {
                return Number(value).toLocaleString();
              },
            },
          },
        },
        elements: {
          line: {
            borderWidth: 3,
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(data: VisitStats[]): void {
    if (!this.chart) return;

    const processedData = this.processData(data);

    this.chart.data.labels = processedData.labels;
    this.chart.data.datasets[0].data = processedData.visits;
    this.chart.data.datasets[1].data = processedData.uniqueVisitors;

    this.chart.update('none');
  }

  private processData(data: VisitStats[]) {
    // Calculer la date d'il y a 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // -6 pour inclure aujourd'hui = 7 jours
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Filtrer les données pour les 7 derniers jours
    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= sevenDaysAgo;
    });

    // Grouper les données par date
    const groupedData = new Map<string, { visits: number; uniqueVisitors: number }>();

    // Initialiser tous les 7 jours avec des valeurs à zéro
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      groupedData.set(dateKey, { visits: 0, uniqueVisitors: 0 });
    }

    // Remplir avec les données réelles
    filteredData.forEach((item) => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (groupedData.has(dateKey)) {
        const existing = groupedData.get(dateKey)!;
        existing.visits += item.visitCount;
        existing.uniqueVisitors += item.uniqueVisitors;
      }
    });

    // Trier par date et formater
    const sortedEntries = Array.from(groupedData.entries()).sort(([a], [b]) => a.localeCompare(b));

    return {
      labels: sortedEntries.map(([date]) => this.formatDate(new Date(date))),
      visits: sortedEntries.map(([, data]) => data.visits),
      uniqueVisitors: sortedEntries.map(([, data]) => data.uniqueVisitors),
    };
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
}
