/**
 * Report Generator - Charts and PDF
 */
class ReportGenerator {
    /**
     * Generate category popularity chart
     */
    static generateCategoryChart(memes, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Count memes by category
        const categoryCount = {};
        memes.forEach(meme => {
            categoryCount[meme.category] = (categoryCount[meme.category] || 0) + 1;
        });

        const categories = Object.keys(categoryCount);
        const counts = Object.values(categoryCount);

        // Create canvas for chart
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Clear canvas
        ctx.fillStyle = '#2d2d44';
        ctx.fillRect(0, 0, width, height);

        if (categories.length === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', width / 2, height / 2);
            return;
        }

        // Draw bars
        const barWidth = chartWidth / categories.length;
        const maxCount = Math.max(...counts);
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

        categories.forEach((category, index) => {
            const barHeight = (counts[index] / maxCount) * chartHeight;
            const x = padding + index * barWidth;
            const y = height - padding - barHeight;

            // Draw bar
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x + 10, y, barWidth - 20, barHeight);

            // Draw label
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(category, x + barWidth / 2, height - padding + 20);
            
            // Draw value
            ctx.fillText(counts[index].toString(), x + barWidth / 2, y - 5);
        });

        // Draw title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Most popular meme categories', width / 2, 25);
    }

    /**
     * Generate PDF report
     */
    static generatePDF(title, data, filename) {
        // Simple PDF generation using window.print() or create downloadable content
        const printWindow = window.open('', '_blank');
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #6366f1; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #6366f1; color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <p>Generated on: ${new Date().toLocaleString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
        `;

        // Add table headers
        if (data.length > 0) {
            Object.keys(data[0]).forEach(key => {
                html += `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`;
            });
        }

        html += `
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Add table rows
        data.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });

        html += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * Generate Top 10 Uploaders PDF
     */
    static generateTopUploadersPDF(users) {
        const sortedUsers = [...users]
            .sort((a, b) => b.stats.totalUploads - a.stats.totalUploads)
            .slice(0, 10);

        const data = sortedUsers.map((user, index) => ({
            'Rank': index + 1,
            'Username': user.username,
            'Total Uploads': user.stats.totalUploads,
            'Total Wins': user.stats.totalWins,
            'Total Likes': user.stats.totalLikes
        }));

        this.generatePDF('Top 10 Uploaders with Most Upload', data, 'top-uploaders.pdf');
    }
}

