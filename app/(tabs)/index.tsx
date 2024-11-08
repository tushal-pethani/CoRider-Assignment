import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon1 from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/Octicons";
import Icon3 from "react-native-vector-icons/Ionicons";
import Icon4 from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import moment from "moment";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [tripInfo, setTripInfo] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [linkMenuVisible, setLinkMenuVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });

  const handleThreeDotsLayout = (event) => {
    const { x, y, height, width } = event.nativeEvent.layout;
    setModalPosition({ top: y + height + 5, right: x - width / 2 });
  };

  const groupMessagesByDate = (messages) => {
    const groupedMessages = [];
    let currentDate = null;

    messages.forEach((message) => {
      const messageDate = moment(message.time).format("YYYY-MM-DD");

      // Add a new date header if it's a new day
      if (messageDate !== currentDate) {
        groupedMessages.push({
          type: "date",
          date: moment(message.time).format("MMMM Do, YYYY"), // Format date more nicely
        });
        currentDate = messageDate;
      }

      // Add the message itself
      groupedMessages.push({
        ...message,
        type: "message",
      });
    });

    return groupedMessages;
  };

  const fetchTripInfo = async () => {
    try {
      const response = await axios.get(
        `https://qa.corider.in/assignment/chat?page=0`
      );
      const data = response.data;

      if (data.from && data.to && data.name) {
        setTripInfo({
          from: data.from,
          to: data.to,
          trip_id: data.name,
        });
      }
    } catch (error) {
      console.error("Error fetching trip info:", error);
    }
  };

  const fetchMessages = async (pageNumber) => {
    if (!hasMore || isFetching) return;

    try {
      setIsFetching(true);
      const response = await axios.get(
        `https://qa.corider.in/assignment/chat?page=${pageNumber}`
      );

      const data = response.data;
      if (Array.isArray(data.chats) && data.chats.length > 0) {
        const newMessages = groupMessagesByDate(data.chats);
        setMessages((prevMessages) => [...newMessages, ...prevMessages]);
      } else {
        setHasMore(false);
      }

      setIsFetching(false);
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTripInfo();
    fetchMessages(0);
  }, []);

  const loadMoreMessages = () => {
    if (!isFetching && hasMore) {
      fetchMessages(page + 1);
    }
  };

  const renderMessage = ({ item }) => {
    if (item.type === "date") {
      return <Text style={styles.dateText}>{item.date}</Text>;
    }

    const isSender =
      item.sender && item.sender.user_id === "67eab7475e5e4dd0903e133705213b43";

    return (
      <View
        style={[styles.messageContainer, isSender && styles.senderContainer]}
      >
        {!isSender && item.sender.image && (
          <Image source={{ uri: item.sender.image }} style={styles.avatar} />
        )}
        <View
          style={[
            styles.messageBubble,
            isSender ? styles.senderBubble : styles.receiverBubble,
          ]}
        >
          <Text style={[styles.messageText, isSender && styles.senderText]}>
            {item.message}
          </Text>
        </View>
      </View>
    );
  };

  const handleOptionPress = (option) => {
    setLinkMenuVisible(false);
    alert(`${option} pressed`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity>
              <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{tripInfo.trip_id || 1}</Text>

            <View style={styles.iconContainer}>
              <TouchableOpacity style={styles.editIconWrapper}>
                <Icon1 name="edit" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Image
              source={{
                uri: "https://fastly.picsum.photos/id/1072/160/160.jpg?hmac=IDpbpA5neYzFjtkdFmBDKXwgr-907ewXLa9lLk9JuA8",
              }}
              style={styles.profileImage}
            />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationText}>
                From{" "}
                <Text style={styles.boldText}>{tripInfo.from || "Origin"}</Text>
              </Text>
              <Text style={styles.locationText}>
                To{" "}
                <Text style={styles.boldText}>
                  {tripInfo.to || "Destination"}
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.moreVertIconWrapper}
              >
                <Icon name="more-vert" size={30} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) =>
            item.type === "date" ? `date-${index}` : item.id.toString()
          }
          inverted
          onEndReachedThreshold={0.5}
          onEndReached={loadMoreMessages}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* Input Box */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Reply to @Rohit Yadav"
              placeholderTextColor="#A9A9A9"
            />
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setLinkMenuVisible(!linkMenuVisible)}
            >
              <Icon1 name="paperclip" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton}>
              <Icon2 name="paper-airplane" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Link Menu Popup */}
        {linkMenuVisible && (
          <View style={styles.linkMenu}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleOptionPress("Photo Camera")}
            >
              <Icon1 name="camera" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleOptionPress("Video Camera")}
            >
              <Icon1 name="video" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleOptionPress("Description")}
            >
              <Icon1 name="file" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.triangle} />
          </View>
        )}

        {/* Modal for 3 dots options */}
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.triangleModal,
                  { top: modalPosition.top, right: modalPosition.right + 20 },
                ]}
              />
              <View
                style={[
                  styles.modalContainer,
                  {
                    top: modalPosition.top + 10,
                    right: modalPosition.right - 20,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress("Members")}
                >
                  <Icon2
                    name="people"
                    size={20}
                    color="black"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionText}>Members</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress("Share Number")}
                >
                  <Icon3
                    name="call-outline"
                    size={20}
                    color="black"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionText}>Share Number</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    width: "100%", // Set the color of the border
                  }}
                  onPress={() => handleOptionPress("Report")}
                >
                  <Icon4
                    name="message-question-outline"
                    size={20}
                    color="black"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionText}>Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f4",
  },
  header: {
    padding: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
    position: "relative",
    marginLeft: 5, // Make the parent container relative to position the icons inside it
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "600",
    color: "#333",
    marginLeft: -200,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    marginRight: 20,
    marginLeft: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 18,
    color: "#666",
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 20,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  senderContainer: {
    justifyContent: "flex-end",
  },
  dateText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginVertical: 10,
  },
  editIconWrapper: {
    position: "absolute", // Absolutely position the edit icon
    top: -30, // Move the edit icon above the 3 dots
    right: 0, // Align to the right of the container
    marginBottom: 10,
    marginTop: 10,
    marginRight: 5,
    // Adds margin specifically between edit and 3 dots icons
  },

  moreVertIconWrapper: {
    position: "absolute", // Keeps the 3 dots icon in the same relative position
    top: 0, // Align the 3 dots icon normally
    right: 0,
    marginRight: 10,
    marginTop: 10, // Align to the right of the container
  },
  messageBubble: {
    padding: 12,
    borderRadius: 15,
    maxWidth: "80%",
  },
  senderBubble: {
    backgroundColor: "#1c63d5",
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },
  receiverBubble: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: "black",
  },
  senderText: {
    color: "white",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    alignSelf: "flex-start",
  },
  inputContainer: {
    marginTop: 20,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingLeft: -10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    height: 50,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginRight: 10,
    paddingHorizontal: 20,
  },
  sendButton: {
    marginHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    position: "absolute",
    backgroundColor: "white",
    // paddingVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e4e5de",
    width: "50%",
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 135,
    marginRight: 43,
  },

  triangleModal: {
    position: "absolute",
    top: -10, // Adjust this value to move the triangle closer or further from the modal
    left: "50%", // Centers the triangle horizontally
    transform: [{ translateX: -10 }], // Adjust this value to center the triangle on the modal
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white", // This ensures the triangle is the same color as the modal background
  },

  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: "100%",
    borderBottomWidth: 1, // Adds a border at the bottom
    borderBottomColor: "#E5E5E5", // Set the color of the border
  },
  iconContainer: {
    position: "relative", // Allow positioning inside this container
    alignItems: "center",
    marginTop: 24,
    marginRight: 8, // Adds margin between the header and the icons
    // Align the icons in the center horizontally
  },
  // Optionally, you can adjust the border style to add more visual separation if needed:
  optionText: {
    fontSize: 16,
    color: "black",
    paddingBottom: 5, // Optional: adjust the spacing between the text and the border
  },
  optionIcon: {
    marginRight: 10,
  },
  inputWrapper: {
    padding: 10,
    backgroundColor: "transparent",
  },
  linkButton: {
    // marginLeft: 10,
    marginRight: 10,
  },
  linkMenu: {
    position: "absolute",
    bottom: 60, // You can adjust the bottom value to move the link menu up/down
    right: 20, // You can adjust the right value to align the menu with the triangle
    backgroundColor: "#24750d",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10, // Adjust to match the position of the triangle
  },

  triangle: {
    position: "absolute",
    bottom: -10, // Moves the triangle beneath the link menu
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    marginLeft: 66,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#24750d", // Same color as the link menu
  },
  iconButton: {
    padding: 7,
    borderRadius: 20,
    marginVertical: 5,
    alignItems: "center",
    color: "white",
  },
});
