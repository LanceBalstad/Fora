interface Props {
  children: string;
  color?: "primary" | "danger" | "secondary";
  onClick: () => void;
}

const Button = ({ children, onClick, color = "danger" }: Props) => {
  return (
    <button className={"btn btn-" + color} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
