import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: "#666666",
    textTransform: "uppercase",
  },
  content: {
    marginTop: 20,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#333333",
    marginBottom: 10,
  },
  heading1: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 15,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 10,
    marginBottom: 4,
  },
  blockquote: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e5e5",
    marginVertical: 10,
    fontStyle: "italic",
    color: "#555555",
  },
  codeBlock: {
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 4,
    marginVertical: 10,
    fontFamily: "Courier",
    fontSize: 9,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 10,
  },
  bullet: {
    width: 10,
    fontSize: 11,
  },
  listItemText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },
});

interface PdfDocumentProps {
  title: string;
  content: any;
  theme?: "modern" | "classic" | "minimal";
  accentColor?: string;
  fontFamily?: string;
}

export const PdfDocument = ({
  title,
  content,
  theme = "modern",
  accentColor = "#1a1a1a",
  fontFamily = "Helvetica",
}: PdfDocumentProps) => {
  const getStyles = () => {
    let baseFont = fontFamily;
    let titleColor = accentColor;
    let bcgColor = "#ffffff";

    if (theme === "classic") {
      baseFont = "Times-Roman";
    } else if (theme === "minimal") {
      bcgColor = "#fafafa";
    }

    return StyleSheet.create({
      page: {
        padding: 40,
        backgroundColor: bcgColor,
        fontFamily: baseFont,
      },
      header: {
        marginBottom: 20,
        borderBottomWidth: theme === "minimal" ? 0 : 1,
        borderBottomColor: "#eeeeee",
        paddingBottom: 10,
      },
      title: {
        fontSize: 24,
        fontWeight: "bold",
        color: titleColor,
        marginBottom: 4,
      },
      date: {
        fontSize: 10,
        color: "#666666",
        textTransform: "uppercase",
      },
      content: {
        marginTop: 20,
      },
      paragraph: {
        fontSize: 11,
        lineHeight: 1.6,
        color: "#333333",
        marginBottom: 10,
      },
      heading1: {
        fontSize: 20,
        fontWeight: "bold",
        color: titleColor,
        marginTop: 15,
        marginBottom: 8,
      },
      heading2: {
        fontSize: 16,
        fontWeight: "bold",
        color: titleColor,
        marginTop: 12,
        marginBottom: 6,
      },
      heading3: {
        fontSize: 14,
        fontWeight: "bold",
        color: titleColor,
        marginTop: 10,
        marginBottom: 4,
      },
      blockquote: {
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: accentColor === "#1a1a1a" ? "#e5e5e5" : accentColor,
        marginVertical: 10,
        fontStyle: "italic",
        color: "#555555",
      },
      codeBlock: {
        backgroundColor: "#f4f4f4",
        padding: 10,
        borderRadius: 4,
        marginVertical: 10,
        fontFamily: "Courier",
        fontSize: 9,
      },
      listItem: {
        flexDirection: "row",
        marginBottom: 4,
        paddingLeft: 10,
      },
      bullet: {
        width: 10,
        fontSize: 11,
        color: accentColor,
      },
      listItemText: {
        flex: 1,
        fontSize: 11,
        lineHeight: 1.5,
      },
    });
  };

  const styles = getStyles();

  const renderNode = (node: any, index: number) => {
    if (!node) return null;

    switch (node.type) {
      case "paragraph":
        return (
          <Text key={index} style={styles.paragraph}>
            {node.content?.map((child: any, i: number) => renderText(child, i))}
          </Text>
        );
      case "heading":
        const level = node.attrs?.level || 1;
        const headingStyle =
          level === 1
            ? styles.heading1
            : level === 2
              ? styles.heading2
              : styles.heading3;
        return (
          <Text key={index} style={headingStyle}>
            {node.content?.map((child: any, i: number) => renderText(child, i))}
          </Text>
        );
      case "blockquote":
        return (
          <View key={index} style={styles.blockquote}>
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </View>
        );
      case "bulletList":
        return (
          <View key={index} style={{ marginVertical: 5 }}>
            {node.content?.map((item: any, i: number) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemText}>
                  {item.content?.map((child: any, j: number) =>
                    renderNode(child, j)
                  )}
                </Text>
              </View>
            ))}
          </View>
        );
      case "orderedList":
        return (
          <View key={index} style={{ marginVertical: 5 }}>
            {node.content?.map((item: any, i: number) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>{i + 1}.</Text>
                <Text style={styles.listItemText}>
                  {item.content?.map((child: any, j: number) =>
                    renderNode(child, j)
                  )}
                </Text>
              </View>
            ))}
          </View>
        );
      case "codeBlock":
        return (
          <View key={index} style={styles.codeBlock}>
            <Text>
              {node.content
                ?.map((child: any, i: number) => child.text)
                .join("")}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderText = (node: any, index: number) => {
    if (node.type !== "text") return null;

    let textStyle: any = {};
    if (node.marks) {
      node.marks.forEach((mark: any) => {
        if (mark.type === "bold") textStyle.fontWeight = "bold";
        if (mark.type === "italic") textStyle.fontStyle = "italic";
        if (mark.type === "underline") textStyle.textDecoration = "underline";
        if (mark.type === "strike") textStyle.textDecoration = "line-through";
      });
    }

    return (
      <Text key={index} style={textStyle}>
        {node.text}
      </Text>
    );
  };

  return (
    <Document title={title} author="Lume Notes">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>
            Generated on{" "}
            {new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
          </Text>
        </View>
        <View style={styles.content}>
          {content?.content?.map((node: any, i: number) => renderNode(node, i))}
        </View>
      </Page>
    </Document>
  );
};
