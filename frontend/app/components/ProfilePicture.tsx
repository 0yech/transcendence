export default function ProfilePicture(props: {
  avatarUrl: string;
  username: string;
}) {
  return <img src={props.avatarUrl} alt={props.username} />;
}
