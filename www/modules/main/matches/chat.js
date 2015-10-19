/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.matches')
        .service('chatDetails', chatDetails)
        .controller('ChatsController', ChatsController)
        .controller('ChatDetailCtrl', ChatDetailCtrl);

    ChatsController.$inject = ['$scope', 'ChatsApi', 'socketEventService', 'onConnectionChangePropertyListener', 'onLoadingPropertyListener'];
    function ChatsController($scope, ChatsApi, socketEventService, onConnectionChangePropertyListener, onLoadingPropertyListener) {
        $scope.isContentSeen = false;

        onConnectionChangePropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onGoodConnection: true,
            onBadConnection: false
        });

        onLoadingPropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onSuccess: true,
            onStart: false
        });

        $scope.$on('connection.on', load);

        load();

        $scope.remove = function() {

        };

        $scope.isChatHighlighted = function(chat) {
            if (chat.message) {
                var msg = chat.message;
                return !msg.wasRead && msg.sender != $scope.userProfile._id;
            }
        };

        socketEventService.listen($scope, 'new_message', function (msg) {
            $scope.chats.forEach(function (chat) {
                if(chat.chat == msg.chat) {
                    chat.message = msg;
                }
            });
        });

        socketEventService.listen($scope, 'message_read', function (msg) {
            $scope.chats.forEach(function (chat) {
                if(chat.chat == msg.chat && $scope.isChatHighlighted(chat)) {
                    chat.message = msg;
                }
            });
        });

        function load() {
            $scope.$broadcast('connection.loading.start', {api: 'ChatsApi', method: 'getChatsInfo'});
            ChatsApi.getChatsInfo()
                .then(function (chats) {
                    $scope.chats = chats;
                    joinChats();
                    $scope.$broadcast('connection.loading.success', {api: 'ChatsApi', method: 'getChatsInfo'});
                }, function (error) {
                    $scope.$broadcast('connection.loading.error', {api: 'ChatsApi', method: 'getChatsInfo', error: error});
                });
        }

        function joinChats() {
            $scope.chats.forEach(function (chat) {
                chat.message || ChatsApi.joinChat(chat.chat);
            })
        }
    }

    ChatDetailCtrl.$inject = ['$scope', '$ionicScrollDelegate', '$timeout', 'chatDetails', 'ChatsApi', 'socketEventService', 'onConnectionChangePropertyListener', 'onLoadingPropertyListener', '$rootScope'];
    function ChatDetailCtrl($scope, $ionicScrollDelegate, $timeout, chatDetails, ChatsApi, socketEventService, onConnectionChangePropertyListener, onLoadingPropertyListener, $rootScope) {
        $scope.isContentSeen = false;
        $scope.activeMessage = {
            text: ''
        };

        onConnectionChangePropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onGoodConnection: true,
            onBadConnection: false
        });

        onLoadingPropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onSuccess: true,
            onStart: false
        });

        $scope.$on('connection.on', load);
        $scope.$watch('isContentSeen', function (newValue) {
            if (newValue === true) {
                $timeout(function() {
                    $ionicScrollDelegate.scrollBottom(true);
                }, 300);
            }
        });

        load();

        window.addEventListener('native.keyboardshow', function() {
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom();
            }, 100);
        });

        window.addEventListener('native.keyboardhide', function() {
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom();
            }, 100);
        });

        $scope.tracker = function (msg) {
            return msg._id + msg.created;
        };

        $scope.isMsgYours = function (msg) {
            return msg.sender == $scope.userProfile._id;
        };

        socketEventService.listen($scope, 'new_message', function(msg) {
            $scope.messages.every(function(scopeMsg, index) {
                if (msg.created == scopeMsg.created) {
                    $scope.messages[index] = msg;
                    return false;
                }
                return true;
            }) && addMessage(msg);
        });

        $scope.sendMessage = function() {
            if ($scope.activeMessage.text) {
                var newMessage = {
                    chat: $scope.chat._id,
                    sender: $scope.userProfile._id,
                    text: $scope.activeMessage.text,
                    created: new Date().toISOString()
                };

                ChatsApi.sendMessage({
                    receiver: $scope.user._id,
                    senderName: $scope.userProfile.firstName,
                    message: newMessage
                });

                newMessage.isSending = true;
                $scope.messages.push(newMessage);

                delete $scope.activeMessage.text;

                messageToAnalytics(newMessage);

                $timeout(function() {
                    $ionicScrollDelegate.scrollBottom(true);
                });
            }
        };

        $scope.previousMessages = function() {
            ChatsApi.getMessages($scope.chat._id, $scope.messages.length)
              .then(function (messages) {
                  $scope.messages = messages.concat($scope.messages);
                  $scope.$broadcast('scroll.refreshComplete');
              })
        };

        function readMessages() {
            $scope.messages.forEach(function (msg) {
                !msg.wasRead && msg.sender != $scope.userProfile._id && ChatsApi.readMessage(msg);
            });
            $rootScope.$broadcast('chat.read', $scope.chat);
        }

        function addMessage(msg) {
            $scope.messages.push(msg);
            ChatsApi.readMessage(msg);
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(true);
            });
        }

        function messageToAnalytics(message) {
            $timeout(function () {
                $scope.messages.forEach(function (scopeMessage) {
                    if (scopeMessage.created == message.created) {
                        message = scopeMessage;
                    }
                });
                $scope.$emit('analytics.event', {
                    category: 'NewMessage',
                    action: !message.isSending ? 'sent': 'not sent',
                    label: 'firstMessage',
                    value: $scope.messages.length == 1 ? 1 : 0
                });
            }, 30000)
        }

        function load() {
            $scope.$broadcast('connection.loading.start', {api: 'chatDetails', method: 'getDetails'});
            chatDetails.getDetails()
                .then(function (details) {
                    $scope.chat = details.chat;
                    $scope.messages = details.messages;
                    $scope.user = details.user;
                    $scope.motivationalMsg = motivationalMsgs[Math.floor(Math.random()*motivationalMsgs.length)];
                    readMessages();
                    ChatsApi.joinChat($scope.chat._id);
                    $scope.$broadcast('connection.loading.success', {api: 'chatDetails', method: 'getDetails'});
                }, function (error) {
                    $scope.$broadcast('connection.loading.error', {api: 'chatDetails', method: 'getDetails', error: error});
                });
        }
    }

    chatDetails.$inject = ['ChatsApi', 'profilesApi', '$stateParams', '$q', '$rootScope'];
    function chatDetails(ChatsApi, profilesApi, $stateParams, $q, $rootScope) {
        this.getDetails = function () {
            var chatPromise = ChatsApi.getChat($stateParams.chatId);
            var messagesPromise = ChatsApi.getMessages($stateParams.chatId);
            var userPromise = chatPromise
                .then(function (chat) {
                    var chatUserId = chat.users[0] == $rootScope.userProfile._id ? chat.users[1] : chat.users[0];
                    return profilesApi.getProfileData(chatUserId)
                })
                .then(function (profileInfo) {
                    return profileInfo;
                });
            return $q.all([chatPromise, messagesPromise, userPromise]).then(function(res) {
                var chat = res[0];
                var messages = res[1];
                var user = res[2];
                chat.name = user.firstName;
                return {
                    chat: chat,
                    messages: messages,
                    user: user
                }
            });
        };
    }

    var motivationalMsgs = [
        'Пообщайтесь с Вашей парой',
        'Сделайте первый шаг!',
        'Напишите что-нибудь - это не страшно',
        'Cкажите что-нибудь смешное!',
        'Напишите комплимент и посмотрите, что получится',
        'Почему бы не сказать "привет"?',
        'Напишите что-нибудь забавное',
        'Будьте вежливы... не молчите!',
        'Не бойтесь!',
        'Предложите выпить чашечку кофе ;)',
        'Вам не помешало бы немного пообщаться!',
        'Как мило... Обязательно напишите Вашей паре!',
        'С такой парой грех не провести прекрасный вечер!',
        'Хороший фильм в компании такой пары. Что может быть лучше?',
        'За окном прекрасная погода. Вам срочно прогуляться!',
        'Отличная шутка не может не вызвать улыбку',
        'Вы выбрали друг друга, теперь дело за малым!'
    ]
})(angular);