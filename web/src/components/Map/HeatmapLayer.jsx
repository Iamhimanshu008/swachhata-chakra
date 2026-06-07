export default function HeatmapLayer({ data }) {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center', 
      color: '#666',
      border: '1px dashed #ccc',
      borderRadius: '8px',
      margin: '10px 0'
    }}>
      <p>🗺️ Heatmap visualization coming soon</p>
      <p style={{fontSize: '12px'}}>
        {data?.length || 0} data points loaded
      </p>
    </div>
  );
}
