package com.example.cas.model.dto;

/**
 * 人员信息查询请求
 */
public class PersonQueryRequest {
    private String ids;        // 人员ID，多个用逗号分隔
    private String idcard;     // 身份证号
    private String userName;   // 用户名
    private String pinyin;     // 拼音
    private String orgCode;    // 组织代码
    private String policeNo;   // 警号
    private Integer start;     // 分页起始
    private Integer size;      // 每页大小

    // Getters and Setters
    public String getIds() {
        return ids;
    }

    public void setIds(String ids) {
        this.ids = ids;
    }

    public String getIdcard() {
        return idcard;
    }

    public void setIdcard(String idcard) {
        this.idcard = idcard;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPinyin() {
        return pinyin;
    }

    public void setPinyin(String pinyin) {
        this.pinyin = pinyin;
    }

    public String getOrgCode() {
        return orgCode;
    }

    public void setOrgCode(String orgCode) {
        this.orgCode = orgCode;
    }

    public String getPoliceNo() {
        return policeNo;
    }

    public void setPoliceNo(String policeNo) {
        this.policeNo = policeNo;
    }

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }
}
