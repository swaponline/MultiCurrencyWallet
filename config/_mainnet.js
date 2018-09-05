export default {
  services: {
    web3: {
      provider: 'https://mainnet.infura.io/5lcMmHUURYg8F20GLGSr',
      rate: 0.1,
      gas: 1e5,
      gasPrice: '20000000000',
    },

    eos: {
      chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
      httpEndpoint: 'https://api.eosnewyork.io',
    },
  },

  ipfs: {
    swarm: '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star/', // '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star/'
    server: 'discovery.libp2p.array.io',
  },

  token: {
    contract: '0x85F806b0df30709886C22ed1be338d2c647Abd6B',
  },

  eth: {
    contract : '0x843FcaAeb0Cce5FFaf272F5F2ddFFf3603F9c2A0',
  },

  eos: {
    contract: 'swaponline42',
  },

  tokens: {
    swap: {
      address: '0x14a52cf6B4F68431bd5D9524E4fcD6F41ce4ADe9',
      decimals: 18,
    },
    BEE: {
      address: '0x4d8fc1453a0f359e99c9675954e656d80d996fbf',
      decimals: 18,
    },
    drt: {
      address: '0x9af4f26941677c706cfecf6d3379ff01bb85d5ab',
      decimals: 8,
    },
    syc: {
      address: '0x49feeF410293261c04F1d14600Ba427F8eED8723',
      decimals: 2,
    },
    YUP: {
      address: '0xD9A12Cde03a86E800496469858De8581D3A5353d',
      decimals: 18,
    },
    SMT: {
      address: '0x21f15966e07a10554c364b988e91dab01d32794a',
      decimals: 18,
    },
    DAO: {
      address: '0x8aA33A7899FCC8eA5fBe6A608A109c3893A1B8b2',
      decimals: 18,
    },
    jot: {
      address: '0xdb455c71c1bc2de4e80ca451184041ef32054001',
      decimals: 18,
    },
    btrm: {
      address: '0xae72146eb535607Ee79f5D8834303ea18751845f',
      decimals: 18,
    },
    omg: {
      address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
      decimals: 18,
    },
    SENC: {
      address: '0xa13f0743951b4f6e3e3aa039f682e17279f52bc3',
      decimals: 18,
    },
    noxon: {
      address: '0x9E4AD79049282F942c1b4c9b418F0357A0637017',
      decimals: 0,
    },

    INSTAR: {
      address: '0xc72fe8e3dd5bef0f9f31f259399f301272ef2a2d',
      decimals: 18,
    },

    UTNP: {
      address: '0x9e3319636e2126e3c0bc9e3134aec5e1508a46c7',
      decimals: 18,
    },


    TNT: {
      address: '0x08f5a9235b08173b7569f83645d2c7fb55e8ccd8',
      decimals: 8,
    },


    POE: {
      address: '0x0e0989b1f9b8a38983c2ba8053269ca62ec9b195',
      decimals: 8,
    },


    FIL: {
      address: '0xb8b01cec5ced05c457654fc0fda0948f859883ca',
      decimals: 2,
    },


    PPP: {
      address: '0xc42209aCcC14029c1012fB5680D95fBd6036E2a0',
      decimals: 18,
    },


    QASH: {
      address: '0x618e75ac90b12c6049ba3b27f5d5f8651b0037f6',
      decimals: 6,
    },


    ELI: {
      address: '0xc7c03b8a3fc5719066e185ea616e87b88eba44a3',
      decimals: 18,
    },


    GEN: {
      address: '0x543ff227f64aa17ea132bf9886cab5db55dcaddf',
      decimals: 18,
    },


    RKT: {
      address: '0x106aa49295b525fcf959aa75ec3f7dcbf5352f1c',
      decimals: 18,
    },


    RFR: {
      address: '0xd0929d411954c47438dc1d871dd6081f5c5e149c',
      decimals: 4,
    },


    STORM: {
      address: '0xd0a4b8946cb52f0661273bfbc6fd0e0c75fc6433',
      decimals: 18,
    },


    HBT: {
      address: '0xdd6c68bb32462e01705011a4e2ad1a60740f217f',
      decimals: 15,
    },


    IND: {
      address: '0xf8e386eda857484f5a12e4b5daa9984e06e73705',
      decimals: 18,
    },


    HOLD: {
      address: '0xd6e1401a079922469e9b965cb090ea6ff64c6839',
      decimals: 18,
    },


    CFI: {
      address: '0x12fef5e57bf45873cd9b62e9dbd7bfb99e32d73e',
      decimals: 18,
    },


    DACC: {
      address: '0x6310e4523ae82c0b6307ccf68708fd6055784b87',
      decimals: 2,
    },


    LEV: {
      address: '0x0f4ca92660efad97a9a70cb0fe969c755439772c',
      decimals: 9,
    },


    AVT: {
      address: '0x0d88ed6e74bbfd96b831231638b66c05571e824f',
      decimals: 18,
    },


    POWR: {
      address: '0x595832f8fc6bf59c85c527fec3740a1b7a361269',
      decimals: 6,
    },


    AIR: {
      address: '0x27dce1ec4d3f72c3e457cc50354f1f975ddef488',
      decimals: 8,
    },


    J8T: {
      address: '0x0d262e5dc4a06a0f1c90ce79c7a60c09dfc884e4',
      decimals: 8,
    },


    DATx: {
      address: '0xabbbb6447b68ffd6141da77c18c7b5876ed6c5ab',
      decimals: 18,
    },


    ATMI: {
      address: '0x4114fb8b1879f61b18f7d2e623569a847a03e15a',
      decimals: 18,
    },


    HYB: {
      address: '0x6059f55751603ead7dc6d280ad83a7b33d837c90',
      decimals: 18,
    },


    SHIP: {
      address: '0xe25b0bba01dc5630312b6a21927e578061a13f55',
      decimals: 18,
    },


    CRPT: {
      address: '0x80a7e048f37a50500351c204cb407766fa3bae7f',
      decimals: 18,
    },


    DXT: {
      address: '0x8db54ca569d3019a2ba126d03c37c44b5ef81ef6',
      decimals: 8,
    },


    CRED: {
      address: '0x672a1ad4f667fb18a333af13667aa0af1f5b5bdd',
      decimals: 18,
    },


    DX: {
      address: '0x70c19e79e8611ed9dd566165647e78dd2bf71764',
      decimals: 8,
    },


    VIB: {
      address: '0x2c974b2d0ba1716e644c1fc59982a89ddd2ff724',
      decimals: 18,
    },


    RCN: {
      address: '0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6',
      decimals: 18,
    },


    SKM: {
      address: '0xd99b8a7fa48e25cce83b81812220a3e03bf64e5f',
      decimals: 18,
    },


    LBA: {
      address: '0xf67da90c14c9176b8e572cb93cf8c847d28602a8',
      decimals: 18,
    },


    ZCO: {
      address: '0x2008e3057bd734e10ad13c9eae45ff132abc1722',
      decimals: 8,
    },


    IPSX: {
      address: '0x001f0aa5da15585e5b2305dbab2bac425ea71007',
      decimals: 18,
    },


    fdX: {
      address: '0x52a7cb918c11a16958be40cba7e31e32a499a465',
      decimals: 18,
    },


    THRT: {
      address: '0x4f27053f32eda8af84956437bc00e5ffa7003287',
      decimals: 18,
    },


    MVP: {
      address: '0x8a77e40936bbc27e80e9a3f526368c967869c86d',
      decimals: 18,
    },


    PAL: {
      address: '0xfedae5642668f8636a11987ff386bfd215f942ee',
      decimals: 18,
    },


    ZXC: {
      address: '0xc4fccdf067129a4d0909555c7e6d894b2b39efeb',
      decimals: 18,
    },


    THETA: {
      address: '0x3883f5e181fccaF8410FA61e12b59BAd963fb645',
      decimals: 18,
    },


    ZIL: {
      address: '0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27',
      decimals: 12,
    },


    TIO: {
      address: '0x80bc5512561c7f85a3a9508c7df7901b370fa1df',
      decimals: 18,
    },


    ZIPT: {
      address: '0xedd7c94fd7b4971b916d15067bc454b9e1bad980',
      decimals: 18,
    },


    ABT: {
      address: '0xb98d4c97425d9908e66e53a6fdf673acca0be986',
      decimals: 18,
    },
    CHX: {
      address: '0x1460a58096d80a50a2F1f956DDA497611Fa4f165',
      decimals: 18,
    },
  },

  link: {
    bitpay: 'https://insight.bitpay.com',
    etherscan: 'https://etherscan.io',
    eos: '',
    omniexplorer: 'https://www.omniexplorer.info',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/BTC',
    bitpay: 'https://insight.bitpay.com/api',
    etherscan: 'https://api.etherscan.io/api',
  },

  apiAlternatives: {
    bitpay: [
      'https://insight.bitpay.com/api',
    ],
  },

  apiKeys: {
    etherscan: 'RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM',
    blocktrail: '1835368c0fa8e71907ca26f3c978ab742a7db42e',
  },
}
