const KpiCard = ({ title, value, subtitle }) => {
  return (
    <div>
      <h3>{title}</h3>
      <p>{value}</p>
      <p>{subtitle}</p>
    </div>
  );
};

export default KpiCard;