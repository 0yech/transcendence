export default function ProfilePicture(props: {
  avatarUrl: string;
  username: string;
}) {
  let avatarUrl = props.avatarUrl;

  if (!props.avatarUrl) {
    avatarUrl = '/unknown.jpg';
  }

  return <img src={avatarUrl} alt={props.username} className="w-24" />;
}
