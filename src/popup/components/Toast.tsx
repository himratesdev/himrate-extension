// TASK-034: ToastPush — push notification below header.

interface Props {
  message: string;
}

export function Toast({ message }: Props) {
  return (
    <div className="toast-push">
      {message}
    </div>
  );
}
