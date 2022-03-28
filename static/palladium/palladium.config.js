self.__palladium$config = {
    prefix: '/service/',
    bare: '/bare/',
    encodeUrl: Palladiumdev.codec.xor.encode,
    decodeUrl: Palladiumdev.codec.xor.decode,
    handler: '/palladium/palladium.handler.js',
    bundle: '/palladium/palladium.bundle.js',
    config: '/palladium/palladium.config.js',
    sw: '/palladium/palladium.sw.js',
};