
if [ "$project" == "" ]; then
  echo "Please enter project to run command for: "
  read project
fi
if [ "$target" == "" ]; then
  echo "Please enter target to build: "
  read -s target
fi

if [ "$env" == "" ]; then
  echo "Please enter env to run command in: "
  read env
fi

if [ "$host" == "" ]; then
  echo "Please enter host to connect to: "
  read host
fi

if [ "$user" == "" ]; then
  echo "Please enter user to connect to $host: "
  read user
fi

if [ "$sshport" == "" ]; then
  sshport=22
fi

if [ "$npm" == "" ]; then
  npm=cnpm
fi

if [ "$root" == "" ]; then
  echo "please specify project root by root=<project root>"
  exit 1
fi

if [ "$remoteRoot" == "" ]; then
  echo "please specify project root by remoteRoot=<remote root>"
  exit 1
fi


# if [ "$password" == "" ]; then
#   echo "Please enter password to connect to $host: "
#   read -s password
# fi

ssh -p $sshport $user@$host  "mkdir $remoteRoot & mkdir $remoteRoot/devops"

echo rsync -azvF -e "ssh -p $sshport" $root/devops/remote/ $user@$host:$remoteRoot/devops/${env}-${project}
rsync -azvF -e "ssh -p $sshport" $root/devops/remote/ $user@$host:$remoteRoot/devops/${env}-${project}

echo run script on remote server with project=$project env=$env
ssh -p $sshport $user@$host  "chmod 777 $remoteRoot/devops/${env}-${project}/${command}.sh"
ssh -p $sshport $user@$host "password=$password project=$project env=$env root=$remoteRoot roomRoot=$roomRoot renpm=$renpm npm=$npm bash -login -c $remoteRoot/devops/${env}-${project}/${command}.sh"

