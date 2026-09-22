type T_AdminFormAlertProps = {
  message?: string;
  title?: string;
  messages?: string[];
};

export const AdminFormAlert = ({ message, title, messages = [] }: T_AdminFormAlertProps) => {
  if (!message && messages.length === 0) return null;

  return (
    <div role="alert" className="rounded-md border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
      {title ? <p className="font-semibold">{title}</p> : null}
      {message ? <p className={title ? "mt-1" : ""}>{message}</p> : null}
      {messages.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {messages.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : null}
    </div>
  );
};
