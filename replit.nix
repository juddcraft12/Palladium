{ pkgs }: {
	deps = [
    pkgs.sudo
    pkgs.unzip
    pkgs.busybox
    pkgs.flyctl
    pkgs.docker
    pkgs.certbot-full
		pkgs.nodejs-12_x
    pkgs.openssh_with_kerberos
        pkgs.nodePackages.typescript-language-server
        pkgs.nodePackages.yarn
        pkgs.replitPackages.jest
	];
}