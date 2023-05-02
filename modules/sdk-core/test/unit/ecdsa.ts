import 'should';
import { Ecdsa } from '../../src';

const testData = [
  {
    ntilde:
      'c220e85cff8eaa0f0ba284356a523cc45c1458001b2aa28569434fd9628258457581ff957c722941b2362c06e1bf2a5940c3c6b9c236d3fb915a9a3bbc487d26dde7fb3ff236a06613afaa0b98cd37315b283fd0961121475db1351bed3735a656a4ea1a943498c074e93914f82ad8f0fea3f6b7741684e603e63e36e2f74525b68a6da048d01d524e1a7ede388562d60d5cace84f9351262716b7c383c7d0e2eef3a98effd46e5779425b9f0021791b5da226f66976fcdc023b6401b1184a78e8c1c4089c3ae4b15655b6997e5533495e6cf1bc6706050f2608f6aa8fdecca708a662a341258f7f5f27d262591b98dc03d36593d59acdcc16a873b8c357a87bf16571b32e31d540dc8ce1d7dd2b0cd9217bf478fa96e828ff71bc521cc1f7d23d1f80143a4eca097410d6aaac5b8318b12c7cde902216b8ac17c24eafe23ff5d48d3e9f6d5c6738cbad6e1e48a0890f2d5220ca58a25010f4fe7f9b8f6e83e5c794f8a0481f93b2ab1b61488cb5cfa7a5a42bb512afcbdc1cfe43808fe76969',
    h1: 'a595033c3961d9cc92a6df228351820a383effed9a6737f406cd799b2532b2ada3d1f9c8f805572248d0bace02edb714dd2cb77f193705c9a99930967e56e80170100d2e7287603a8df9fd4105029058209b91a1779d7c4bc8272a78ac63f974770060aacf0eace313ff5af18dfd59efac172b8d26e958800646b98a98fba594cc0b16089239206319ad2c15602d0dd14108d3a476d07ca2cf4c0ec9d30a5df1b7bc0f27d229168863b5e274455e3131e5a79b85c3eadfb5f036cb460e195dee16978f694fd23bb676ff757f07060cfef649584994b1f5e52c4b26b4244e3cd65e87301d05e50318a770cacedd62801b22268ac9458827ba35ba7f483ab2ddb35a3b03d2ee132ba5f44e93c521a9550f020bfdde450960abe1392c45db9c50f1696d312126a47c5f278be691c5edeca346deb3152c74d4a40a9049cb40984745d8966117e7bd6b9db09faad6945903ec74a0c4009a42bde1b777794e3cb493ce054898cd6e3f3ff8392d8f82575648e9e4bec166e7d18cc6783bc7562b53e6d0',
    h2: '179c11307bfe2c84493bb6fa1ec72854e890608ba0e49fb8a370f6f0f5227c790778bf41dae8763a0937ed622aaa798d1a4870bec50395cc1538b8530dd4ca8299cca5ed0c45c92b5e00a197ac56b2920cb4078cb9ceeadf753805b77e1350c7a863af261c9032fe1a910053a27c44867585c29445aa767333c4b812f33310071ff095f9f842f4e0dff5c8b6003dd3703f76957c4e0134b40f5f86d1d384ec21a786a13217822606bfb7c109f6da0242291cfa62758b53eeed56c4b3837c8145edc03e0aa5c7c662247072350ef4d2888b5048c8a982796bb581f21abb59b0ac93cf1224b93f4d07e61df300ebcb0647161c5908968bcdb0c63b9c4ea566b4a87730685a7b3aad1a28f35011ad352eb59e54e5c4162e55be1c1791e55ea86a205898906f15dcb681d843838dbfe482c84a61a3ce789fbf0145c9bd4651fbc8a5826ebe8b0a00d2a4e4f428178000ed93dfefaa9b6a5c6324edad5e18f403fbd3dcbb169e588cd4f7df91f196fa71b9900841ff7a73778c8000900c2a2a0e583b',
  },
  {
    ntilde:
      'c3bf9480cc8856b1e75dfd9844ead84ba409a310d8fee6a6e4b605f9e1c20934b1267ed80e5831de1ff830d9be116b47f73571ca72fd570b695c8efaa16814633f4caf4210e39fd16d34cd489711edf424cce66b5ea0eb926313232b65b37916e43aea41c10814b20997e225a67f3c7104457032427502b71db229b52a5de6ad1ae61cce71a37ff50e9e068aa92c75da8dd56901d349bc50c62484df077e133a2e3e07f51c4410dd88b22f6b084a4001e29c09454ac9606623a369d0399930ec3f2aed7233582ef0171579c146bd6d694bd56ad6cd226f038f2e4c18188b5eef16cc4f3562771c75195fefb2dfb7b5e8f31d2228a5bbde2914b104c0c79c288750a62a36e3f1f9849f4effba6f86d0034c1b175172bff2a7524241dc2b27bd230d7be556712b3cb005f3095c15bfda2bea51959eb78d55822ba765656021b30926fbe5e1c1a3978bd3d146c2b9e8cb27e7d922d52cfdd6296fcd440ee302e3e1a95d005c2c5086b258eefce0a0fd6b8becc36cec8d91600d77b54ef5ef57fbf5',
    h1: '307e213241bcd49c7998da5189949c129ca96749023c559a42a96b6f7f208ddd889ba7bb3c188a55641c2dad5c8a1f5a2de65e30704791df6e07388240e621c7dcf5f4bd8bb92e2a25917230d63ca9ce78fe4ee0fa5ac2de7c5d6d020edbf7f3fbdf43f6515fcfc3f2e3aebc346def803f4192182d286a970c3453b866179dc920ce5a90d8def2007b915077e20cde3c3d1380e65753af72755b2334eb66cabb6fadb3d41da23ac6d07570b109ef31f92bd76d55faa6d321ea9b1b24dcb8bdd1cfa9a42156779b3cbaa690b62cbd897a6851d04e7fa5444fabb0e0cc0812fa104ca4b76b62bc7816d8a9f71c3fb471e742287a98692cf604e1e81d5db00f840d6e1da133600ed1088285f1449b3d47000cc319ea129a0436c8f22b59105df505297bf110502c83d062bff1efd2d5e3e1b8c2b0b692d7ff487741f27354f66fcd0f90d24cac0671d528b2561ce72e2aedc357c1e6900588704fcb2b863387115c151ccf30c062d5dc541291b57c170aa256a7dc73825127b74f0a078600428efc',
    h2: '287a26bf9efefd5558ef324952207aa070428d77b6da47cff4c91444fefe35e33bd9ba47dfcb1e9bfda0cd0456bf72e1dcff367769879f7c3a8c98511a54375a3b09c0359d6c9954a23b7107ce15729b48cfbf6b40012ea2cceacca7c50ee8db3fa109e8989ed485abaa029fda1471e9f4fe8d617afbfd4f0f0b3efe19e21f112815e79d251fdbd5ce99b16c8f106a7a869bcc4da3489c1785b82b5bae9084e3efa87bc7ab372ae1f2c548e17a3b1f202c014e6cbfd523602711ad9c592d2b30b0659516c045b23c8fff81109898b8ef1ab6a1954c040f43bd0eb85fc5750ef8c74c908b87394a50ab92a2d5ac6156f18dce249df7775a0e390a66f3ae56a1a2c2a3b3cffbe9c42a56bf7185d827bddf9679ba0ecc00724409906f30b08c05e02311b0d5cf4b7d287afb835e177f2f65fd0c782739f1312795850c6b5c9f723e68f0e9039c07e0c11c5fb23553f1373f9036da1f57cb10473a561aff9fa5200644c478ea132b077e4042a3adaf47b5cd9abff167e786e5e7492e895afca6c0f9',
  },
  {
    ntilde:
      'c1e21e60eb3aa5ec2e2a3e799ebc306c4457806fd6bc6b119600af3919f2c27d6df904a4764fc8f329f4d65df5768fc1c1ac0d65efbd12c1a834758cb7b586c0875da1c14c443d4ad0e37452c4209aba0ec5b6477b685f065b062311886a8f25d17886512eb707e9748c08a19e9933eafdb4839b2a03a980e0794e34ec5e13ea2d7e71e4021336e753123fdf54d8137f54980fa864ced64d76b95d97e0f13941617ec0ef63aab83ba0a40a3db7c48f4b74c93c98ea69d7eadfde685fa8f645e75a75537b530ff214fe4345ae4c75c9b29d0d9284cdbcd6a4b8497a80559084a5acf7b8c286d6cd2db681c099e3f0f37da3371229f3649011fdcdaa72c6da65bf08ef42a38ec4b596b566891ad62de18542706d0842112c07682d048cae9bc04111b8f1b0d9aed279c6e041c4381591d46d0a11f78272262659a4873da7549ca43935134e6f5665d0ad0aa2d65a1e5d897a85a895791c4192c8815c37fbc7bf4182ba94c8b3bc18f7c5dbf28402e0fa180a6e2cf98d1387a3827d4512feddb075',
    h1: '08bf2b43c3c5e97b930489924a84f77cee1fbc30e7f3aa43fda9fe5dbd87f857953e8fb7e45e7b1a69cf80737e7438e380a24eb02edf28ce91851c1c290f97743d60d8730ad87c8100718464fed6c9e9373cf5d5434f5600cf5907302fab55ef71cbbc03441afa12263acdb125134b56508f7d644b5f85c074c0f14597d497d0f3d7b62ec9580491f67fbe95396c57485b0096e8ad8a0cead8c6f2d75a36b14ab97ed8ff0e535f01223c0d8a0d4b09e73cd502247d21f9f5a0f3cfdee32a04153b1feb9ba7f200d25db789914d26a5d512e0f90f7db4c3b9c29f161b90da5eb6f6b8661a3e015533961f762d10db4fb80f413cddc4171a9bedf70b51550cf8d35dd184b58af341972839b73262fea12a9059d130a18599ede43960b06233df3a56fad3dec6af23be9c3fcc19b4a0a4264c58f624b288add7a478c674e249f3a1afd71c3baa2d181b34f68373120ec3c2fc2c0aa5a42e345b26e55b9b0416db3b50e4badf44f63118684b1b86efbed65dc89c20706f4889fbfa51b14dd5edb3b5',
    h2: '7d91b0698b9263d3cb9f2b0f0ffbe6ed885ef28ecfcdece8d1a0e4ce7207dc05e9830a032f7a73c2885ef25f355edce7f5a866fb22839477192352be089adb0d369b7e5716f0f72df77e9aa3b616202bb949f81404c2bdf3a1d4a1adbdd62fc3c603b4f48f293f6754abffd658e1c500ddd8277a901b91620565ef4894d1d5ea2908bac755493210e7ac4f5b30e6a9ebe21fb0d9f74c3481c5c9d9561f072e0b0e92e7656a405b8d10fd2bc96b779396100bba0a2c58e464fe578d867013119fcee9637856abc67cacb10ee6e964adfda1e501cb7d6034e23da252cd7bce5698235192bbbc6dcc405bcd04a8ccb7e8ead70160a0a7f7b04d6bba93a70c5ebabafc66ae59fc843c3c066e727e704013ecaeb1bff4034837f262b38ae50cbb4bc0942b567b0554edacf887839fdde142421fa4b917a683db78edcf7094df46c0432f286906c3d865a40a5097c6ff1b7dd8a19e962c5c9f6ed93d5469d524855b9ccbb0ca5d54c2682085b217e3815c489f5458a92fb6f60b0b3e4f44e247a72506',
  },
];
describe('Ecdsa', function () {
  it('serializeNtilde and deserializeNtilde are deterministic', function () {
    testData.forEach((serializeChallengeBefore) => {
      const deserializeChallenge = Ecdsa.deserializeNtilde(serializeChallengeBefore);
      const serializeChallengeAfter = Ecdsa.serializeNtilde(deserializeChallenge);
      serializeChallengeBefore.should.deepEqual(serializeChallengeAfter);
    });
  });
});
