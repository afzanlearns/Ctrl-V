import { useUIStore } from '../store/uiStore';
import { NoteCanvas } from '../components/Notes/NoteCanvas';
import { WritePad } from '../components/WritePad/WritePad';

export function HomePage() {
  const { activeWritePad } = useUIStore();

  if (activeWritePad) {
    return (
      <div className="animate-fade-in">
        <WritePad />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <NoteCanvas />
    </div>
  );
}
