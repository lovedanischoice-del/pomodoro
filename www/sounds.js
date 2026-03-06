// ==============================================
// Sound Configuration (소리 설정)
// ==============================================
// 여기에 새로운 배경음과 알림음을 추가하면 자동으로 설정 화면에 나타납니다.

const SOUND_CONFIG = {
    // 배경음 (Background Music)
    bgm: [
        {
            id: 'crackle',
            name: '모닥불 (Crackle Campfire)',
            file: 'sounds/bgm/Crackle_Campfire.mp3'
        },
        {
            id: 'rain',
            name: '빗소리 (Gentle Rain)',
            file: 'sounds/bgm/Fentlerain.mp3'
        },
        {
            id: 'fireplace',
            name: '벽난로 (Fireplace Loop)',
            file: 'sounds/bgm/Fireplace-loop.mp3'
        },
        {
            id: 'library',
            name: '도서관 (Library)',
            file: 'sounds/bgm/Library.mp3'
        },
        {
            id: 'om',
            name: '옴 명상 (Om Chant)',
            file: 'sounds/bgm/om.mp3'
        },
        {
            id: 'singingbowl',
            name: '싱잉볼 (Singing Bowl)',
            file: 'sounds/bgm/singing_bowl.mp3'
        }
    ],

    // 알림음 (Notification Bells)
    bells: [
        {
            id: 'chime',
            name: '기본 차임벨 (Default Chime)',
            file: 'sounds/bells/chime.mp3'
        },
        {
            id: 'bell',
            name: '종소리 (Bell)',
            file: 'sounds/bells/Bell.mp3'
        },
        {
            id: 'opening',
            name: '오프닝 벨 (Opening Bell)',
            file: 'sounds/bells/Opening-Bell.mp3'
        },
        {
            id: 'school',
            name: '학교 종 (School Bell)',
            file: 'sounds/bells/School_bel.mp3'
        },
        {
            id: 'notification',
            name: '알림음 (Notification)',
            file: 'sounds/bells/bell-notification.mp3'
        },
        {
            id: 'dragon',
            name: '스튜디오 벨 (Studio Bell)',
            file: 'sounds/bells/dragon-studio-bell-ring-.mp3'
        },
        {
            id: 'bell3',
            name: '청명한 벨 (Clear Bell)',
            file: 'sounds/bells/freesounds123-bell-sound-370341.mp3'
        },
        {
            id: 'doorbell',
            name: '초인종 (Old Doorbell)',
            file: 'sounds/bells/old-style-door-bell-101191.mp3'
        }
    ]
};

// 전역 변수로 설정 (다른 파일에서 사용 가능)
window.SOUND_CONFIG = SOUND_CONFIG;
