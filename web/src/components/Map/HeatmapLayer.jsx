export default function HeatmapLayer({ bins = [], showPulse = true }) {
    return (
        <div style={{padding: '20px', textAlign: 'center', 
          color: '#666', border: '1px dashed #ccc', 
          borderRadius: '8px'}}>
          Heatmap coming soon
        </div>
    );
}

/**
 * HeatmapLegend — floating legend card for the heatmap.
 */
export function HeatmapLegend() {
    return (
        <div className="heatmap-legend">
            <p className="heatmap-legend-title">Waste Heat Index</p>
            <div className="heatmap-legend-bar" />
            <div className="heatmap-legend-labels">
                <span>🟢 Cool · Empty</span>
                <span>🟠 Warm</span>
                <span>🔴 Hot · Overflow</span>
            </div>
        </div>
    );
}
