{ pkgs }: {
	deps = [
		pkgs.nodejs-16_x
    pkgs.openssh_with_kerberos
        pkgs.nodePackages.typescript-language-server
        pkgs.nodePackages.yarn
        pkgs.replitPackages.jest
	];
}