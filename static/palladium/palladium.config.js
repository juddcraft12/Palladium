self.__palladium$config = {
    prefix: '/service/',
    bare: '/bare/',
    encodeUrl: Palladium.codec.xor.encode,
    decodeUrl: Palladium.codec.xor.decode,
    handler: '/palladium/palladium.handler.js',
    bundle: '/palladium/palladium.bundle.js',
    config: '/palladium/palladium.config.js',
    sw: '/palladium/palladium.sw.js',
};