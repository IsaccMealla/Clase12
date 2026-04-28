export default function Timer({ time }) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <span>
      Tiempo: {String(minutes).padStart(2, '0')}:
      {String(seconds).padStart(2, '0')}
    </span>
  );
}